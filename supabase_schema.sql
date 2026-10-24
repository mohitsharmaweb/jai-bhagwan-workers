-- ==============================================================================
-- JAI BHAGWAN WORKER MANAGEMENT SYSTEM - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- Run this complete script in your Supabase Project -> SQL Editor
-- This sets up the 'workers' and 'message_logs' tables, indexes, and Row Level Security (RLS).
-- ==============================================================================

-- 1. Enable UUID Extension (if not already enabled)
create extension if not exists "uuid-ossp";

-- 2. CREATE 'workers' TABLE
create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile varchar(15) not null unique,
  whatsapp varchar(15) not null,
  profession text not null,
  profession_other text,
  experience integer not null default 0,
  area text not null,
  area_other text,
  address text,
  consent boolean not null default true,
  status text not null default 'active', -- 'active' or 'inactive'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for high-speed searching and filtering
create index if not exists idx_workers_profession on public.workers(profession);
create index if not exists idx_workers_area on public.workers(area);
create index if not exists idx_workers_mobile on public.workers(mobile);
create index if not exists idx_workers_created_at on public.workers(created_at desc);

-- 3. CREATE 'message_logs' TABLE
create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid references public.workers(id) on delete set null,
  worker_name text not null,
  worker_mobile text not null,
  template_type text default 'custom',
  message text not null,
  sent_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexing for message history
create index if not exists idx_message_logs_worker_id on public.message_logs(worker_id);
create index if not exists idx_message_logs_sent_at on public.message_logs(sent_at desc);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on both tables
alter table public.workers enable row level security;
alter table public.message_logs enable row level security;

-- Drop any pre-existing policies to allow clean re-runs
drop policy if exists "Allow public to register workers" on public.workers;
drop policy if exists "Allow admins full access to workers" on public.workers;
drop policy if exists "Allow admins full access to message_logs" on public.message_logs;

-- Policy 1: Anyone (Public / Unauthenticated) can insert a new worker registration
create policy "Allow public to register workers"
on public.workers
for insert
with check (true);

-- Policy 2: Authenticated Users (Admins) have full CRUD on workers
create policy "Allow admins full access to workers"
on public.workers
for all
to authenticated
using (true)
with check (true);

-- Policy 3: Authenticated Users (Admins) have full access to message logs
create policy "Allow admins full access to message_logs"
on public.message_logs
for all
to authenticated
using (true)
with check (true);

-- ==============================================================================
-- SAMPLE INITIAL DATA (JAIPUR WORKERS)
-- Uncomment the block below if you want test data right away:
-- ==============================================================================
/*
insert into public.workers (name, mobile, whatsapp, profession, experience, area, address, consent)
values 
  ('Ramesh Kumar Sharma', '9829012345', '9829012345', 'Mistri', 12, 'Mansarovar', 'Sector 7, Shipra Path', true),
  ('Mohan Lal Verma', '9414012345', '9414012345', 'Electrician', 8, 'Malviya Nagar', 'Near Calgiri Hospital', true),
  ('Suresh Jangid', '9828012345', '9828012345', 'Carpenter', 15, 'Sanganer', 'Main Bazaar, Sanganer', true),
  ('Kailash Chand', '9602012345', '9602012345', 'Plumber', 6, 'Vaishali Nagar', 'Amrapali Circle', true),
  ('Dinesh Gujjar', '9785012345', '9785012345', 'Painter', 9, 'Jhotwara', 'Pankha Circle', true),
  ('Pappu Ram', '9928012345', '9928012345', 'Helper', 4, 'Bani Park', 'Station Road', true)
on conflict (mobile) do nothing;
*/
