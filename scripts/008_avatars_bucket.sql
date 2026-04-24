-- SwiftHire AI — Private bucket for resume profile pictures.
-- Path convention: {user_id}/{resume_id}.webp
-- Reads always go through server-generated 1h signed URLs.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

drop policy if exists "avatars_own_select" on storage.objects;
create policy "avatars_own_select"
on storage.objects for select
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_own_insert" on storage.objects;
create policy "avatars_own_insert"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_own_update" on storage.objects;
create policy "avatars_own_update"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "avatars_own_delete" on storage.objects;
create policy "avatars_own_delete"
on storage.objects for delete
using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
