-- Follow-up from Supabase database advisors: index foreign keys and keep RLS plans stable.

create index if not exists deletion_requests_child_id_idx
  on public.deletion_requests(child_id)
  where child_id is not null;

drop policy if exists "events_admin_select" on public.product_events;
create policy "events_admin_select" on public.product_events for select to authenticated
  using (coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin');

drop policy if exists "deletion_owner_select" on public.deletion_requests;
drop policy if exists "deletion_owner_insert" on public.deletion_requests;
drop policy if exists "deletion_admin_all" on public.deletion_requests;

create policy "deletion_select" on public.deletion_requests for select to authenticated
  using (
    (select auth.uid()) = user_id
    or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

create policy "deletion_insert" on public.deletion_requests for insert to authenticated
  with check (
    (
      (select auth.uid()) = user_id
      and (child_id is null or child_id in (
        select id from public.children where parent_id = (select auth.uid())
      ))
    )
    or coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
  );

create policy "deletion_admin_update" on public.deletion_requests for update to authenticated
  using (coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin')
  with check (coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin');
