-- ====================================================================
-- PROPOSED — NOT APPLIED. Do not run until the preflight output has been
-- reviewed, names are reconciled with the live schema, it has run cleanly on
-- staging, and a named owner has approved it. See 000_README.md.
-- ====================================================================
-- 006 Academy. Published courses are public; enrollments, progress and certificates are owner-only.
-- Assessments and assignments are NOT proposed yet (need product decisions).

begin;

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  title text not null,
  summary text not null default '',
  level text not null default 'beginner' check (level in ('beginner','intermediate','advanced')),
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null,
  unique (course_id, position)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules(id) on delete cascade,
  title text not null,
  content_ref text,
  position integer not null,
  duration_minutes integer check (duration_minutes is null or duration_minutes > 0),
  unique (module_id, position)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active','completed','dropped')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete restrict,
  issued_at timestamptz not null default now(),
  verification_code text not null unique,
  unique (user_id, course_id)
);

create trigger courses_updated_at before update on public.courses
  for each row execute function public.find_set_updated_at();

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;
revoke all on public.enrollments, public.lesson_progress, public.certificates from anon;

create policy "courses public read" on public.courses for select to anon, authenticated
  using (status = 'published' or public.has_role('admin'));
create policy "courses admin write" on public.courses for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "modules read via course" on public.course_modules for select to anon, authenticated
  using (exists (select 1 from public.courses c where c.id = course_id and (c.status = 'published' or public.has_role('admin'))));
create policy "modules admin write" on public.course_modules for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "lessons read via course" on public.lessons for select to anon, authenticated
  using (exists (
    select 1 from public.course_modules m join public.courses c on c.id = m.course_id
    where m.id = module_id and (c.status = 'published' or public.has_role('admin'))
  ));
create policy "lessons admin write" on public.lessons for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

create policy "enrollments owner select" on public.enrollments for select to authenticated using (user_id = (select auth.uid()));
create policy "enrollments owner insert" on public.enrollments for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published'));
create policy "enrollments owner update" on public.enrollments for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "progress owner all" on public.lesson_progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "certificates owner select" on public.certificates for select to authenticated using (user_id = (select auth.uid()));
-- Certificates are issued server-side only (no insert policy).

-- Public verification without exposing the table.
create or replace function public.verify_certificate(p_code text)
returns table (course_title text, issued_at timestamptz)
language sql stable security definer set search_path = public as $$
  select c.title, ce.issued_at
  from public.certificates ce join public.courses c on c.id = ce.course_id
  where ce.verification_code = p_code
$$;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;

commit;

-- ROLLBACK: drop function if exists public.verify_certificate(text); drop table if exists public.certificates, public.lesson_progress, public.enrollments, public.lessons, public.course_modules, public.courses;
