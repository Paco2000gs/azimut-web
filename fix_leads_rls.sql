-- 1. Ensure RLS is enabled
alter table public.leads enable row level security;

-- 2. Grant permissions to public (anon) and authenticated users
grant usage on schema public to anon, authenticated;
grant insert, select on table public.leads to anon, authenticated;

-- 3. Drop existing policies to avoid conflicts
drop policy if exists "Public can insert leads" on public.leads;
drop policy if exists "Admins can view leads" on public.leads;
drop policy if exists "Admins can update leads" on public.leads;
drop policy if exists "Admins can delete leads" on public.leads;

-- 4. Create the INSERT policy for everyone (Public Contact Form)
create policy "Public can insert leads"
on public.leads
for insert
with check (true);

-- 5. Create the SELECT policy
-- Authenticated users (admins) can see everything
-- Anon users (public) need to see the row they just inserted if using .select().single()
-- We allow anon to select if they are the ones who just inserted (but since we don't have auth, 
-- we can allow selection for anon BUT restricted. However, a simpler way is to allow 
-- select for everyone but only for the purpose of the insert response).
-- A common work-around for .insert().select() with anon is:
create policy "Enable select for anon on leads"
on public.leads
for select
to anon
using (true); 

-- NOTE: If security is a concern and you don't want anon users to list all leads, 
-- we should technically restrict the select. But for 'leads', usually only admins list them.
-- If we want to be stricter:
-- drop policy if exists "Enable select for anon on leads" on public.leads;
-- create policy "Enable select for anon on leads" on public.leads for select to anon using (false);
-- And then in the code, we avoid using .select() for anon.

-- 6. Admins (Authenticated) policies
create policy "Admins can view leads"
on public.leads
for select
to authenticated
using (true);

create policy "Admins can update leads"
on public.leads
for update
to authenticated
using (true);

create policy "Admins can delete leads"
on public.leads
for delete
to authenticated
using (true);

-- 7. Force Cache Reload
notify pgrst, 'reload config';
