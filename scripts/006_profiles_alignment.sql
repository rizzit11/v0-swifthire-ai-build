-- Align public.profiles with the sign-up flow:
-- 1. Ensure `onboarded` boolean exists (used by /dashboard router).
-- 2. Allow role to be null during sign-up; /dashboard redirects to a picker if null.
-- 3. Re-apply the handle_new_user trigger so new auth.users always get a profile row
--    even if role metadata is missing.

alter table public.profiles
  add column if not exists onboarded boolean not null default false;

-- Drop the NOT NULL constraint on role if present (safe if already nullable).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'role'
      and is_nullable = 'NO'
  ) then
    execute 'alter table public.profiles alter column role drop not null';
  end if;
end$$;

-- If a CHECK constraint on role was strict, keep it but allow nulls.
-- (CHECK constraints permit NULL by default.)

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, onboarded)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null),
    nullif(new.raw_user_meta_data ->> 'role', ''),
    false
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
