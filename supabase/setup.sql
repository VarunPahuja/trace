-- Trace — tracker_entries table + RLS policies (Phase 8: Supabase tracker sync)
--
-- Run this once in the Supabase SQL editor for your project (Dashboard ->
-- SQL Editor -> New query -> paste -> Run). Safe to re-run: every
-- statement is idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS first).
--
-- After running this, the app activates cloud sync automatically as soon
-- as NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set —
-- no code changes needed. See HANDOFF.md for the full setup checklist.

create extension if not exists pgcrypto;

create table if not exists public.tracker_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  link text,
  topic text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  time_minutes int not null default 0,
  intuition text default '',
  notes text default '',
  status text not null check (status in ('solved', 'revisit', 'stuck')),
  created_at timestamptz not null default now()
);

-- The app always queries/mutates scoped to the signed-in user, so this
-- index carries almost every real query this table sees.
create index if not exists tracker_entries_user_id_created_at_idx
  on public.tracker_entries (user_id, created_at desc);

alter table public.tracker_entries enable row level security;

drop policy if exists "select own entries" on public.tracker_entries;
create policy "select own entries"
  on public.tracker_entries for select
  using (auth.uid() = user_id);

drop policy if exists "insert own entries" on public.tracker_entries;
create policy "insert own entries"
  on public.tracker_entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own entries" on public.tracker_entries;
create policy "update own entries"
  on public.tracker_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own entries" on public.tracker_entries;
create policy "delete own entries"
  on public.tracker_entries for delete
  using (auth.uid() = user_id);
