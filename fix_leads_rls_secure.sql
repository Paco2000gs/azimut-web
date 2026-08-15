-- Leads: lock SELECT to authenticated admins only.
--
-- Context: fix_leads_rls.sql created "Enable select for anon on leads" ... using (true),
-- which lets any visitor read every lead (name, email, phone) with the public anon key
-- that ships in the JS bundle. It existed only so an .insert().select() round-trip would
-- return the inserted row. The client no longer does that: LeadsContext inserts without
-- .select(), and the admin dashboard reads leads through a real Supabase session
-- (AuthContext -> signInWithPassword), i.e. as the `authenticated` role.
--
-- Run this in the Supabase SQL editor. Step 1 is a read-only check: look at the output
-- before running the rest.

-- 1. What is actually live right now.
select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'leads'
order by cmd, policyname;

-- 2. Remove public read access.
drop policy if exists "Enable select for anon on leads" on public.leads;
revoke select on table public.leads from anon;

-- 3. Keep the public contact forms working: insert only, no read-back.
alter table public.leads enable row level security;
grant insert on table public.leads to anon;

drop policy if exists "Public can insert leads" on public.leads;
create policy "Public can insert leads"
on public.leads
for insert
to anon, authenticated
with check (true);

-- 4. Admins keep full access through their authenticated session.
drop policy if exists "Admins can view leads" on public.leads;
create policy "Admins can view leads"
on public.leads
for select
to authenticated
using (true);

-- 5. Reload PostgREST so the new grants take effect immediately.
notify pgrst, 'reload config';

-- 6. Verify: this must now list no SELECT policy for the anon role.
select policyname, roles, cmd
from pg_policies
where schemaname = 'public' and tablename = 'leads'
order by cmd, policyname;
