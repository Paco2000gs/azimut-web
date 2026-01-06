-- 1. Create the table if it doesn't exist
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  email text,
  phone text,
  interest text,
  message text,
  source text,
  status text default 'New',
  property_title text
);

-- 2. Enable RLS
alter table public.leads enable row level security;

-- 3. Policies (Drop first to avoid duplicates)

-- Allow ANYONE (Public) to insert leads (Crucial for Contact Form)
drop policy if exists "Public can insert leads" on public.leads;
create policy "Public can insert leads"
on public.leads
for insert
with check (true);

-- Allow ADMINS to do everything
drop policy if exists "Admins can view leads" on public.leads;
create policy "Admins can view leads"
on public.leads
for select
using (auth.role() = 'authenticated');

drop policy if exists "Admins can update leads" on public.leads;
create policy "Admins can update leads"
on public.leads
for update
using (auth.role() = 'authenticated');

drop policy if exists "Admins can delete leads" on public.leads;
create policy "Admins can delete leads"
on public.leads
for delete
using (auth.role() = 'authenticated');
