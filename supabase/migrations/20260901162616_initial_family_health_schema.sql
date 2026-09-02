create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text check (phone is null or char_length(phone) between 8 and 24),
  country_code text not null default 'BR' check (country_code ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.communication_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email_opt_in boolean not null default false,
  whatsapp_opt_in boolean not null default false,
  whatsapp_frequency text not null default 'off' check (whatsapp_frequency in ('off','important','weekly','few_times_week')),
  consent_version text,
  consented_at timestamptz,
  updated_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 1 and 80),
  birth_date date not null check (birth_date <= current_date),
  sex_for_growth_reference text check (sex_for_growth_reference in ('female','male')),
  allergies text[] not null default '{}',
  intolerances text[] not null default '{}',
  dislikes text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index children_parent_id_idx on public.children(parent_id);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5,2) not null check (weight_kg > 0 and weight_kg <= 300),
  height_cm numeric(5,2) not null check (height_cm > 20 and height_cm <= 250),
  created_at timestamptz not null default now(),
  unique(child_id, measured_on)
);
create index measurements_child_id_idx on public.measurements(child_id);

create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  food_name text not null check (char_length(food_name) between 1 and 120),
  quantity numeric(10,2) check (quantity is null or quantity >= 0),
  unit text check (unit is null or char_length(unit) <= 30),
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index pantry_items_user_id_idx on public.pantry_items(user_id);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  meal_type text not null check (meal_type in ('breakfast','morning_snack','lunch','afternoon_snack','dinner','supper')),
  foods jsonb not null default '[]'::jsonb check (jsonb_typeof(foods) = 'array'),
  served_at timestamptz not null default now(),
  source text not null default 'family' check (source in ('family','assistant','professional')),
  created_at timestamptz not null default now()
);
create index meals_child_id_served_at_idx on public.meals(child_id, served_at desc);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  logged_on date not null default current_date,
  water_check boolean not null default false,
  movement_check boolean not null default false,
  sleep_check boolean not null default false,
  family_meal_check boolean not null default false,
  new_foods_count smallint not null default 0 check (new_foods_count between 0 and 30),
  notes text check (notes is null or char_length(notes) <= 1000),
  unique(child_id, logged_on)
);
create index habit_logs_child_id_idx on public.habit_logs(child_id);

alter table public.profiles enable row level security;
alter table public.communication_preferences enable row level security;
alter table public.children enable row level security;
alter table public.measurements enable row level security;
alter table public.pantry_items enable row level security;
alter table public.meals enable row level security;
alter table public.habit_logs enable row level security;

create policy "profiles_owner_all" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "preferences_owner_all" on public.communication_preferences for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "children_parent_all" on public.children for all to authenticated using ((select auth.uid()) = parent_id) with check ((select auth.uid()) = parent_id);
create policy "pantry_owner_all" on public.pantry_items for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "measurements_parent_all" on public.measurements for all to authenticated using (child_id in (select id from public.children where parent_id = (select auth.uid()))) with check (child_id in (select id from public.children where parent_id = (select auth.uid())));
create policy "meals_parent_all" on public.meals for all to authenticated using (child_id in (select id from public.children where parent_id = (select auth.uid()))) with check (child_id in (select id from public.children where parent_id = (select auth.uid())));
create policy "habit_logs_parent_all" on public.habit_logs for all to authenticated using (child_id in (select id from public.children where parent_id = (select auth.uid()))) with check (child_id in (select id from public.children where parent_id = (select auth.uid())));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  v_email_opt_in boolean := coalesce((new.raw_user_meta_data ->> 'email_opt_in')::boolean, false);
  v_whatsapp_opt_in boolean := coalesce((new.raw_user_meta_data ->> 'whatsapp_opt_in')::boolean, false);
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), 'Responsável'), nullif(new.raw_user_meta_data ->> 'phone',''));
  insert into public.communication_preferences (user_id, email_opt_in, whatsapp_opt_in, whatsapp_frequency, consent_version, consented_at)
  values (new.id, v_email_opt_in, v_whatsapp_opt_in, case when v_whatsapp_opt_in then 'weekly' else 'off' end, '2026-09-01', case when v_email_opt_in or v_whatsapp_opt_in then now() else null end);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
