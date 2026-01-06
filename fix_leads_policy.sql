-- Enable RLS on leads table (if not already enabled)
alter table leads enable row level security;

-- Allow public (anon) and authenticated users to insert leads
drop policy if exists "Public can insert leads" on public.leads;
create policy "Public can insert leads"
on public.leads
for insert
with check (true);

-- Allow admins (authenticated) to view all leads
drop policy if exists "Admins can view leads" on public.leads;
create policy "Admins can view leads"
on public.leads
for select
using (auth.role() = 'authenticated');

-- Allow admins (authenticated) to update leads
drop policy if exists "Admins can update leads" on public.leads;
create policy "Admins can update leads"
on public.leads
for update
using (auth.role() = 'authenticated');

-- Allow admins (authenticated) to delete leads
drop policy if exists "Admins can delete leads" on public.leads;
create policy "Admins can delete leads"
on public.leads
for delete
using (auth.role() = 'authenticated');
