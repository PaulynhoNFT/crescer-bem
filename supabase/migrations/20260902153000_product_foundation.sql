-- Product foundation: auditable consents, connected planning and minimized analytics.

alter table public.pantry_items
  add column if not exists category text not null default 'other';

alter table public.meals
  add column if not exists title text,
  add column if not exists recipe_snapshot jsonb,
  add column if not exists feedback text,
  add column if not exists saved boolean not null default false;

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('terms','privacy','email_marketing','whatsapp')),
  status text not null check (status in ('granted','revoked')),
  version text not null check (char_length(version) between 1 and 40),
  source text not null check (char_length(source) between 1 and 80),
  occurred_at timestamptz not null default now()
);

create table if not exists public.weekly_menu_items (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  planned_for date not null,
  meal_type text not null check (meal_type in ('breakfast','morning_snack','lunch','afternoon_snack','dinner','supper')),
  title text not null check (char_length(title) between 1 and 180),
  recipe_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(recipe_snapshot) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, planned_for, meal_type)
);

create table if not exists public.shopping_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  item_name text not null check (char_length(item_name) between 1 and 120),
  category text not null default 'other',
  quantity numeric(10,2) check (quantity is null or quantity >= 0),
  unit text check (unit is null or char_length(unit) <= 30),
  checked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid,
  event_name text not null check (event_name in ('landing_viewed','generator_started','ingredient_added','meal_generated','meal_saved','meal_rejected','substitution_requested','pantry_created','weekly_menu_created','shopping_list_created','account_created','whatsapp_opted_in','whatsapp_opted_out','return_7d','return_30d')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object' and octet_length(metadata::text) <= 4096),
  occurred_at timestamptz not null default now()
);

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  scope text not null check (scope in ('account','child_profile')),
  child_id uuid references public.children(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested','identity_check','processing','completed','cancelled')),
  requested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((scope = 'account' and child_id is null) or (scope = 'child_profile' and child_id is not null))
);

create index if not exists consent_records_user_time_idx on public.consent_records(user_id, occurred_at desc);
create index if not exists weekly_menu_child_date_idx on public.weekly_menu_items(child_id, planned_for);
create index if not exists shopping_items_user_checked_idx on public.shopping_items(user_id, checked, created_at);
create index if not exists product_events_name_time_idx on public.product_events(event_name, occurred_at desc);
create index if not exists product_events_user_time_idx on public.product_events(user_id, occurred_at desc);
create index if not exists deletion_requests_user_time_idx on public.deletion_requests(user_id, requested_at desc);

alter table public.consent_records enable row level security;
alter table public.weekly_menu_items enable row level security;
alter table public.shopping_items enable row level security;
alter table public.product_events enable row level security;
alter table public.deletion_requests enable row level security;

drop policy if exists "consents_owner_select" on public.consent_records;
drop policy if exists "consents_owner_insert" on public.consent_records;
create policy "consents_owner_select" on public.consent_records for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "consents_owner_insert" on public.consent_records for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "weekly_menu_parent_all" on public.weekly_menu_items;
create policy "weekly_menu_parent_all" on public.weekly_menu_items for all to authenticated
  using (child_id in (select id from public.children where parent_id = (select auth.uid())))
  with check (child_id in (select id from public.children where parent_id = (select auth.uid())));

drop policy if exists "shopping_owner_all" on public.shopping_items;
create policy "shopping_owner_all" on public.shopping_items for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "events_owner_insert" on public.product_events;
drop policy if exists "events_admin_select" on public.product_events;
create policy "events_owner_insert" on public.product_events for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "events_admin_select" on public.product_events for select to authenticated
  using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

drop policy if exists "deletion_owner_select" on public.deletion_requests;
drop policy if exists "deletion_owner_insert" on public.deletion_requests;
drop policy if exists "deletion_admin_all" on public.deletion_requests;
create policy "deletion_owner_select" on public.deletion_requests for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "deletion_owner_insert" on public.deletion_requests for insert to authenticated
  with check ((select auth.uid()) = user_id and (child_id is null or child_id in (select id from public.children where parent_id = (select auth.uid()))));
create policy "deletion_admin_all" on public.deletion_requests for all to authenticated
  using (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin')
  with check (coalesce((select auth.jwt() -> 'app_metadata' ->> 'role'), '') = 'admin');

revoke all on table public.consent_records, public.weekly_menu_items, public.shopping_items, public.product_events, public.deletion_requests from anon;
grant select, insert on table public.consent_records to authenticated;
grant select, insert, update, delete on table public.weekly_menu_items, public.shopping_items to authenticated;
grant select, insert on table public.product_events to authenticated;
grant select, insert, update on table public.deletion_requests to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_email_opt_in boolean := coalesce(new.raw_user_meta_data ->> 'email_opt_in', 'false') = 'true';
  v_whatsapp_opt_in boolean := coalesce(new.raw_user_meta_data ->> 'whatsapp_opt_in', 'false') = 'true';
  v_terms boolean := coalesce(new.raw_user_meta_data ->> 'terms_accepted', 'false') = 'true';
  v_privacy boolean := coalesce(new.raw_user_meta_data ->> 'privacy_accepted', 'false') = 'true';
  v_version text := coalesce(nullif(new.raw_user_meta_data ->> 'consent_version',''), '2026-09-02');
  v_source text := coalesce(nullif(new.raw_user_meta_data ->> 'consent_source',''), 'web_signup');
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), 'Responsável'), nullif(new.raw_user_meta_data ->> 'phone',''));

  insert into public.communication_preferences (user_id, email_opt_in, whatsapp_opt_in, whatsapp_frequency, consent_version, consented_at)
  values (new.id, v_email_opt_in, v_whatsapp_opt_in, case when v_whatsapp_opt_in then 'weekly' else 'off' end, v_version, case when v_email_opt_in or v_whatsapp_opt_in then now() else null end);

  if v_terms then
    insert into public.consent_records (user_id, purpose, status, version, source) values (new.id, 'terms', 'granted', v_version, v_source);
  end if;
  if v_privacy then
    insert into public.consent_records (user_id, purpose, status, version, source) values (new.id, 'privacy', 'granted', v_version, v_source);
  end if;
  if v_email_opt_in then
    insert into public.consent_records (user_id, purpose, status, version, source) values (new.id, 'email_marketing', 'granted', v_version, v_source);
  end if;
  if v_whatsapp_opt_in then
    insert into public.consent_records (user_id, purpose, status, version, source) values (new.id, 'whatsapp', 'granted', v_version, v_source);
  end if;

  insert into public.product_events (user_id, event_name, metadata)
  values (new.id, 'account_created', jsonb_build_object('source', v_source));
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
