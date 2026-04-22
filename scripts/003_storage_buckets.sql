-- SwiftHire AI — Storage bucket for resume PDFs.
-- Private bucket; path convention: {user_id}/{resume_id}.pdf

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Policies: candidates can only access objects inside their own folder.
drop policy if exists "resumes_own_select" on storage.objects;
create policy "resumes_own_select"
on storage.objects for select
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "resumes_own_insert" on storage.objects;
create policy "resumes_own_insert"
on storage.objects for insert
with check (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "resumes_own_update" on storage.objects;
create policy "resumes_own_update"
on storage.objects for update
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "resumes_own_delete" on storage.objects;
create policy "resumes_own_delete"
on storage.objects for delete
using (
  bucket_id = 'resumes'
  and (storage.foldername(name))[1] = auth.uid()::text
);
