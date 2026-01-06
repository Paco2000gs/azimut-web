-- 1. Ensure columns exist (Alter table is safer for existing tables)
alter table public.leads add column if not exists interest text;
alter table public.leads add column if not exists source text;
alter table public.leads add column if not exists property_title text;
alter table public.leads add column if not exists status text default 'New';

-- 2. Force Cache Reload (Notify Supabase)
notify pgrst, 'reload config';
