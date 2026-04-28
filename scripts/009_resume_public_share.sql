-- ============================================================
-- SwiftHire AI — Resume public-share + tracker/cache idempotent re-apply
-- Adds is_public + public_slug to resumes for /resume/[id] sharing,
-- and re-runs job_search_cache + job_tracker DDL in case task 1
-- migrations missed the latest deploy. Idempotent.
-- ============================================================

-- ---------- resumes: public share flag ----------
alter table public.resumes
  add column if not exists is_public boolean not null default false,
  add column if not exists public_slug text;

create unique index if not exists resumes_public_slug_uniq
  on public.resumes (public_slug)
  where public_slug is not null;

-- Allow ANYONE (anon + authenticated) to read a resume that the candidate
-- has explicitly marked public. The owner's own ALL policy still wins for
-- private rows. The Next.js public route (/resume/[id]) relies on this.
drop policy if exists resumes_public_read on public.resumes;
create policy resumes_public_read on public.resumes
  for select using (is_public = true and archived_at is null);

-- ---------- jobs: ensure anon read for open jobs ----------
-- The /jobs/[id] public route renders dynamic OpenGraph metadata for
-- social sharing; the existing tenant policy already exposes open jobs
-- via OR-clause, but make it explicit for the anon role.
drop policy if exists jobs_public_open_read on public.jobs;
create policy jobs_public_open_read on public.jobs
  for select using (status = 'open' and archived_at is null);

-- ---------- Re-apply job_search_cache + job_tracker (idempotent) ----------

create table if not exists public.job_search_cache (
  query_hash text primary key,
  results jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.job_search_cache enable row level security;

drop policy if exists job_search_cache_read on public.job_search_cache;
create policy job_search_cache_read on public.job_search_cache
  for select using (auth.role() = 'authenticated');

drop policy if exists job_search_cache_insert on public.job_search_cache;
create policy job_search_cache_insert on public.job_search_cache
  for insert with check (auth.role() = 'authenticated');

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

drop trigger if exists job_tracker_set_updated_at on public.job_tracker;
create trigger job_tracker_set_updated_at
  before update on public.job_tracker
  for each row execute function public.set_updated_at();

alter table public.job_tracker enable row level security;

drop policy if exists job_tracker_owner_all on public.job_tracker;
create policy job_tracker_owner_all on public.job_tracker
  for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
