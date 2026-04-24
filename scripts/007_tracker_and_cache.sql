-- ============================================================
-- SwiftHire AI — Job search cache + Kanban tracker
-- Adds job_search_cache (JSearch 12h cache) and job_tracker
-- (Kanban board with fractional-indexing `position`).
-- Idempotent.
-- ============================================================

-- JSearch / generic job-search response cache.
-- Keyed by a hash of the user query + filters; clients compute the hash.
create table if not exists public.job_search_cache (
  query_hash text primary key,
  results jsonb not null,
  created_at timestamptz not null default now()
);

-- Cached search results are shared (non-PII). Allow authenticated read,
-- and allow authenticated insert (the server route uses service role anyway).
alter table public.job_search_cache enable row level security;

drop policy if exists job_search_cache_read on public.job_search_cache;
create policy job_search_cache_read on public.job_search_cache
  for select using (auth.role() = 'authenticated');

drop policy if exists job_search_cache_insert on public.job_search_cache;
create policy job_search_cache_insert on public.job_search_cache
  for insert with check (auth.role() = 'authenticated');

-- ---------- Kanban job tracker ----------
-- position uses double precision (fractional indexing); a single drag
-- only updates the moved row's position — never a full column reshuffle.
create table if not exists public.job_tracker (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  job_data jsonb not null default '{}'::jsonb,
  status text not null
    check (status in ('wishlist','applied','interviewing','offer','rejected')),
  position double precision not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists job_tracker_candidate_status_pos_idx
  on public.job_tracker (candidate_id, status, position);

-- Keep updated_at fresh on row updates.
drop trigger if exists job_tracker_set_updated_at on public.job_tracker;
create trigger job_tracker_set_updated_at
  before update on public.job_tracker
  for each row execute function public.set_updated_at();

alter table public.job_tracker enable row level security;

drop policy if exists job_tracker_owner_all on public.job_tracker;
create policy job_tracker_owner_all on public.job_tracker
  for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
