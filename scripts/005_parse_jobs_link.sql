-- Link parse jobs back to the resume they belong to, plus timing field.
alter table public.resume_parse_jobs
  add column if not exists resume_id uuid references public.resumes(id) on delete cascade,
  add column if not exists started_at timestamptz;

create index if not exists resume_parse_jobs_resume_id_idx
  on public.resume_parse_jobs (resume_id);
