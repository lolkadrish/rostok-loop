create table public.rostok_farms (
  user_id uuid primary key references auth.users(id) on delete cascade,
  revision uuid not null,
  snapshot jsonb not null check (
    jsonb_typeof(snapshot) = 'object'
    and snapshot ?& array['farm','code']
    and jsonb_typeof(snapshot->'farm') = 'object'
    and jsonb_typeof(snapshot->'code') = 'string'
    and octet_length(snapshot::text) <= 2000000
  )
);
alter table public.rostok_farms enable row level security;
revoke all on public.rostok_farms from public, anon, authenticated;
grant select, insert on public.rostok_farms to authenticated;
grant update (revision, snapshot) on public.rostok_farms to authenticated;
create policy rostok_read_own on public.rostok_farms for select to authenticated using ((select auth.uid()) = user_id);
create policy rostok_create_own on public.rostok_farms for insert to authenticated with check ((select auth.uid()) = user_id);
create policy rostok_update_own on public.rostok_farms for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
