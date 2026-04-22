-- Auto-create a profiles row when a new auth user is created.
-- Runs as security definer so it bypasses RLS on insert.
-- Role stays null → user is routed through /onboarding to pick candidate/hr.

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
