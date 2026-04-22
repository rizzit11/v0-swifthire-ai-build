-- ============================================================
-- SwiftHire AI — Enterprise schema (Spec §4)
-- Multi-tenant, soft-delete, RLS-enforced. Idempotent.
-- ============================================================

-- =========== PROFILES & TENANTS ===========

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  role text check (role in ('candidate','hr','admin')),
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  created_at timestamptz not null default now()
);

create table if not exists public.hr_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id), -- tenant id
  title text,
  created_at timestamptz not null default now()
);

-- Isolated demographics (Spec §4: strictly locked down; HR cannot read).
create table if not exists public.candidate_demographics (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid unique not null references public.profiles(id) on delete cascade,
  gender text,
  race_ethnicity text,
  veteran_status text,
  disability_status text,
  created_at timestamptz not null default now()
);

-- =========== BUSINESS ENTITIES ===========

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id), -- tenant id
  created_by uuid not null references public.profiles(id),
  title text not null,
  description text not null,
  status text not null default 'open' check (status in ('draft','open','closed','archived')),
  archived_at timestamptz, -- soft delete
  created_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id),
  file_url text,
  parsed_data jsonb not null default '{}'::jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id),
  data jsonb not null,
  frozen_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id), -- tenant id
  job_id uuid not null references public.jobs(id),
  candidate_id uuid not null references public.profiles(id),
  resume_version_id uuid not null references public.resume_versions(id), -- immutable snapshot
  status text not null default 'submitted'
    check (status in ('submitted','screening','shortlisted','rejected','offer','hired','withdrawn')),
  match_score numeric,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id), -- tenant id (null => practice mode)
  application_id uuid references public.applications(id),
  candidate_id uuid not null references public.profiles(id),
  mode text not null check (mode in ('practice','screening')),
  status text not null default 'in_progress'
    check (status in ('in_progress','completed','cancelled')),
  final_rubric_score jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.interview_thumbnails (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  timestamp_sec int not null,
  image_url text not null,
  flagged boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.bias_reports (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id), -- tenant id
  job_id uuid not null references public.jobs(id),
  report_data jsonb not null,
  generated_at timestamptz not null default now()
);

-- =========== ASYNC PARSE QUEUE (Spec §5.1) ===========
-- Pattern: POST enqueues row (status='pending'), worker updates status
-- to 'completed' + parsed_data; client polls GET /api/ai/resume-parse/[taskId].

create table if not exists public.resume_parse_jobs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  file_name text,
  status text not null default 'pending'
    check (status in ('pending','processing','completed','failed')),
  parsed_data jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- =========== INDEXES ===========

create index if not exists jobs_company_active_idx
  on public.jobs (company_id) where archived_at is null;
create index if not exists applications_tenant_idx
  on public.applications (company_id, job_id) where archived_at is null;
create index if not exists applications_candidate_idx
  on public.applications (candidate_id) where archived_at is null;
create index if not exists resumes_candidate_active_idx
  on public.resumes (candidate_id) where archived_at is null;
create index if not exists interview_sessions_candidate_idx
  on public.interview_sessions (candidate_id) where archived_at is null;
create index if not exists interview_thumbnails_session_idx
  on public.interview_thumbnails (session_id, timestamp_sec);
create index if not exists resume_parse_jobs_candidate_idx
  on public.resume_parse_jobs (candidate_id, created_at desc);

-- =========== RLS ENABLE ===========

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.hr_profiles enable row level security;
alter table public.candidate_demographics enable row level security;
alter table public.jobs enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.applications enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_thumbnails enable row level security;
alter table public.bias_reports enable row level security;
alter table public.resume_parse_jobs enable row level security;

-- =========== RLS POLICIES ===========

-- profiles: users manage their own row
drop policy if exists profiles_self_select on public.profiles;
create policy profiles_self_select on public.profiles
  for select using (auth.uid() = id);

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update using (auth.uid() = id);

drop policy if exists profiles_self_insert on public.profiles;
create policy profiles_self_insert on public.profiles
  for insert with check (auth.uid() = id);

-- companies: HR can read their own tenant; anyone authenticated can insert
-- (to cover self-service company creation during onboarding)
drop policy if exists companies_tenant_select on public.companies;
create policy companies_tenant_select on public.companies
  for select using (
    id in (select company_id from public.hr_profiles where profile_id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists companies_authenticated_insert on public.companies;
create policy companies_authenticated_insert on public.companies
  for insert with check (auth.uid() is not null);

-- hr_profiles: self read/insert
drop policy if exists hr_profiles_self on public.hr_profiles;
create policy hr_profiles_self on public.hr_profiles
  for select using (profile_id = auth.uid());

drop policy if exists hr_profiles_insert_self on public.hr_profiles;
create policy hr_profiles_insert_self on public.hr_profiles
  for insert with check (profile_id = auth.uid());

-- candidate_demographics: candidate writes own row ONLY; HR has NO direct access.
drop policy if exists demographics_self_select on public.candidate_demographics;
create policy demographics_self_select on public.candidate_demographics
  for select using (candidate_id = auth.uid());

drop policy if exists demographics_self_upsert on public.candidate_demographics;
create policy demographics_self_upsert on public.candidate_demographics
  for insert with check (candidate_id = auth.uid());

drop policy if exists demographics_self_update on public.candidate_demographics;
create policy demographics_self_update on public.candidate_demographics
  for update using (candidate_id = auth.uid());

-- jobs: HR reads/writes within tenant; candidates read open jobs (non-archived)
drop policy if exists jobs_hr_tenant_select on public.jobs;
create policy jobs_hr_tenant_select on public.jobs
  for select using (
    company_id in (select company_id from public.hr_profiles where profile_id = auth.uid())
    or (status = 'open' and archived_at is null)
  );

drop policy if exists jobs_hr_tenant_insert on public.jobs;
create policy jobs_hr_tenant_insert on public.jobs
  for insert with check (
    company_id in (select company_id from public.hr_profiles where profile_id = auth.uid())
    and created_by = auth.uid()
  );

drop policy if exists jobs_hr_tenant_update on public.jobs;
create policy jobs_hr_tenant_update on public.jobs
  for update using (
    company_id in (select company_id from public.hr_profiles where profile_id = auth.uid())
  );

-- resumes: candidate only
drop policy if exists resumes_candidate_all on public.resumes;
create policy resumes_candidate_all on public.resumes
  for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());

-- resume_versions: candidate (via parent resume); HR can read versions referenced
-- by an application they can see.
drop policy if exists resume_versions_candidate_select on public.resume_versions;
create policy resume_versions_candidate_select on public.resume_versions
  for select using (
    resume_id in (select id from public.resumes where candidate_id = auth.uid())
    or id in (
      select resume_version_id from public.applications a
      where a.company_id in (
        select company_id from public.hr_profiles where profile_id = auth.uid()
      )
    )
  );

drop policy if exists resume_versions_candidate_insert on public.resume_versions;
create policy resume_versions_candidate_insert on public.resume_versions
  for insert with check (
    resume_id in (select id from public.resumes where candidate_id = auth.uid())
  );

-- applications: candidate sees own; HR sees tenant
drop policy if exists applications_candidate_select on public.applications;
create policy applications_candidate_select on public.applications
  for select using (candidate_id = auth.uid());

drop policy if exists applications_hr_tenant_select on public.applications;
create policy applications_hr_tenant_select on public.applications
  for select using (
    company_id in (select company_id from public.hr_profiles where profile_id = auth.uid())
  );

drop policy if exists applications_candidate_insert on public.applications;
create policy applications_candidate_insert on public.applications
  for insert with check (candidate_id = auth.uid());

drop policy if exists applications_hr_tenant_update on public.applications;
create policy applications_hr_tenant_update on public.applications
  for update using (
    company_id in (select company_id from public.hr_profiles where profile_id = auth.uid())
  );

-- interview_sessions: candidate sees own; HR sees tenant (when company_id set)
drop policy if exists interview_sessions_candidate on public.interview_sessions;
create policy interview_sessions_candidate on public.interview_sessions
  for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());

drop policy if exists interview_sessions_hr_tenant_select on public.interview_sessions;
create policy interview_sessions_hr_tenant_select on public.interview_sessions
  for select using (
    company_id is not null and company_id in (
      select company_id from public.hr_profiles where profile_id = auth.uid()
    )
  );

-- interview_thumbnails: candidate reads/inserts own; HR reads sessions they own
drop policy if exists thumbnails_candidate on public.interview_thumbnails;
create policy thumbnails_candidate on public.interview_thumbnails
  for all using (
    session_id in (select id from public.interview_sessions where candidate_id = auth.uid())
  );

drop policy if exists thumbnails_hr_tenant_select on public.interview_thumbnails;
create policy thumbnails_hr_tenant_select on public.interview_thumbnails
  for select using (
    session_id in (
      select id from public.interview_sessions
      where company_id in (
        select company_id from public.hr_profiles where profile_id = auth.uid()
      )
    )
  );

-- bias_reports: HR tenant read only
drop policy if exists bias_reports_hr_tenant_select on public.bias_reports;
create policy bias_reports_hr_tenant_select on public.bias_reports
  for select using (
    company_id in (select company_id from public.hr_profiles where profile_id = auth.uid())
  );

-- resume_parse_jobs: candidate scoped
drop policy if exists parse_jobs_candidate_all on public.resume_parse_jobs;
create policy parse_jobs_candidate_all on public.resume_parse_jobs
  for all using (candidate_id = auth.uid()) with check (candidate_id = auth.uid());
