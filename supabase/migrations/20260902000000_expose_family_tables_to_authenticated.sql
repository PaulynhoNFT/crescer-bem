-- Keep the public API surface explicit: authenticated families can reach these
-- tables through PostgREST, while row-level security still restricts every row
-- to its owning account.
grant select, insert, update, delete on table
  public.profiles,
  public.communication_preferences,
  public.children,
  public.measurements,
  public.pantry_items,
  public.meals,
  public.habit_logs
to authenticated;
