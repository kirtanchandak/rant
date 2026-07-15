-- ============================================================
-- Rant – Mood Analysis Table
-- Run this in your Supabase SQL Editor.
-- ============================================================

-- Entry moods table (one mood analysis per entry)
create table if not exists entry_moods (
  id         uuid primary key default gen_random_uuid(),
  entry_id   uuid references entries(id) on delete cascade not null unique,
  user_id    uuid references auth.users(id) on delete cascade not null,
  mood_score integer not null check (mood_score >= 0 and mood_score <= 100),
  mood_label text not null,
  emotions   jsonb default '[]'::jsonb,
  summary    text,
  created_at timestamptz default now() not null
);

-- Index for fast per-user mood queries sorted by date
create index if not exists entry_moods_user_id_idx
  on entry_moods (user_id);

create index if not exists entry_moods_entry_id_idx
  on entry_moods (entry_id);

-- Row Level Security
alter table entry_moods enable row level security;

create policy "Users can manage their own entry moods"
  on entry_moods for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
