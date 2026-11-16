-- Run this in your Supabase project: SQL Editor -> New query -> paste & run

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  submitted_at timestamptz not null default now(),
  grade_level text,
  used_ai text,
  ai_tools jsonb default '[]'::jsonb,
  answers jsonb not null default '{}'::jsonb
);

-- Allow anonymous inserts (students submit without login)
alter table public.responses enable row level security;

create policy "allow anon insert" on public.responses
  for insert to anon with check (true);

-- Only service role can read all (admin uses service role key)
create policy "service role read all" on public.responses
  for select to service_role using (true);

create index if not exists responses_submitted_at_idx on public.responses (submitted_at desc);
-- (room column removed)
