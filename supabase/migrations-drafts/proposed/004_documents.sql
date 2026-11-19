-- ====================================================================
-- PROPOSED — NOT APPLIED. Do not run until the preflight output has been
-- reviewed, names are reconciled with the live schema, it has run cleanly on
-- staging, and a named owner has approved it. See 000_README.md.
-- ====================================================================
-- 004 Document vault. Private bucket; owner-only via folder = user id.
-- ASSUMES public.applications.id is uuid and public.applications.user_id exists (verify with preflight).
-- Creating the bucket is a data change in storage.buckets: review it explicitly.

begin;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('cv','transcript','certificate','id_document','language_certificate','recommendation_letter','motivation_letter','portfolio','essay','other')),
  title text not null,
  original_filename text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 10485760),
  storage_path text not null unique,
  status text not null default 'active' check (status in ('active','archived')),
  expires_on date,
  current_version integer not null default 1 check (current_version >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_user_idx on public.documents (user_id, category);

create table if not exists public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version integer not null check (version >= 1),
  storage_path text not null,
  size_bytes bigint not null check (size_bytes > 0),
  mime_type text not null,
  created_at timestamptz not null default now(),
  unique (document_id, version)
);

create table if not exists public.application_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (application_id, document_id)
);

create trigger documents_updated_at before update on public.documents
  for each row execute function public.find_set_updated_at();

alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.application_documents enable row level security;
revoke all on public.documents, public.document_versions, public.application_documents from anon;

create policy "documents owner all" on public.documents for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "versions owner select" on public.document_versions for select to authenticated
  using (exists (select 1 from public.documents d where d.id = document_id and d.user_id = (select auth.uid())));
create policy "versions owner insert" on public.document_versions for insert to authenticated
  with check (exists (select 1 from public.documents d where d.id = document_id and d.user_id = (select auth.uid())));

create policy "application documents owner all" on public.application_documents for all to authenticated
  using (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = (select auth.uid()))
    and exists (select 1 from public.documents d where d.id = document_id and d.user_id = (select auth.uid()))
  )
  with check (
    exists (select 1 from public.applications a where a.id = application_id and a.user_id = (select auth.uid()))
    and exists (select 1 from public.documents d where d.id = document_id and d.user_id = (select auth.uid()))
  );

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents bucket owner select" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents bucket owner insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents bucket owner update" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "documents bucket owner delete" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

commit;

-- ROLLBACK (data loss for stored files; take a backup first):
-- drop policy if exists "documents bucket owner select" on storage.objects; (repeat for insert/update/delete)
-- drop table if exists public.application_documents; drop table if exists public.document_versions; drop table if exists public.documents;
