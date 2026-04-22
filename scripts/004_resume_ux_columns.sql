-- Additive columns used by the candidate workspace UX.
-- Keeps the canonical schema (§4) intact; adds display + scoring fields.

alter table public.resumes
  add column if not exists title text,
  add column if not exists is_primary boolean not null default false,
  add column if not exists ats_score numeric,
  add column if not exists storage_path text,
  add column if not exists parse_status text not null default 'pending'
    check (parse_status in ('pending','processing','completed','failed'));

-- Ensure only one primary resume per candidate.
create unique index if not exists resumes_one_primary_per_candidate
  on public.resumes (candidate_id)
  where is_primary = true and archived_at is null;

-- Keep updated_at fresh on row updates.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resumes_set_updated_at on public.resumes;
create trigger resumes_set_updated_at
  before update on public.resumes
  for each row execute function public.set_updated_at();
