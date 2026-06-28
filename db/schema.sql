-- ============================================================
-- Rant – Supabase Schema
-- Paste this into your Supabase SQL Editor and run it.
-- ============================================================

-- Entries table
create table if not exists entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade not null,
  content    text not null default '',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Index for fast per-user queries sorted by date
create index if not exists entries_user_id_created_at_idx
  on entries (user_id, created_at desc);

-- Full-text search index
create index if not exists entries_content_fts_idx
  on entries using gin(to_tsvector('english', content));

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger entries_updated_at
  before update on entries
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table entries enable row level security;

-- Users can only see their own entries
create policy "Users can view their own entries"
  on entries for select
  using (auth.uid() = user_id);

-- Users can only insert entries for themselves
create policy "Users can insert their own entries"
  on entries for insert
  with check (auth.uid() = user_id);

-- Users can only update their own entries
create policy "Users can update their own entries"
  on entries for update
  using (auth.uid() = user_id);

-- Users can only delete their own entries
create policy "Users can delete their own entries"
  on entries for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Enable Supabase Realtime (optional, for future use)
-- ============================================================
-- alter publication supabase_realtime add table entries;

-- ============================================================
-- Knowledge Graph (Memories, Events, Relationships)
-- ============================================================

create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null,
  name text not null,
  summary text,
  metadata jsonb default '{}'::jsonb,
  status text default 'proposed',
  confidence numeric default 1.0,
  first_seen timestamptz default now(),
  last_seen timestamptz default now(),
  mention_count integer default 1,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create trigger memories_updated_at
  before update on memories
  for each row execute function update_updated_at();

alter table memories enable row level security;
create policy "Users can manage their own memories"
  on memories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  summary text,
  event_date text,
  confidence numeric default 1.0,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now() not null
);

alter table events enable row level security;
create policy "Users can manage their own events"
  on events for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  source_memory_id uuid references memories(id) on delete cascade not null,
  relation text not null,
  target_memory_id uuid references memories(id) on delete cascade not null,
  confidence numeric default 1.0,
  created_at timestamptz default now() not null
);

alter table relationships enable row level security;
create policy "Users can manage their own relationships"
  on relationships for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
