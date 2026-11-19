-- ====================================================================
-- PROPOSED — NOT APPLIED. Do not run until the preflight output has been
-- reviewed, names are reconciled with the live schema, it has run cleanly on
-- staging, and a named owner has approved it. See 000_README.md.
-- ====================================================================
-- 002 Profiles. Owner-only. Public/members visibility needs a separate allow-listed view
-- (never expose date_of_birth or phone); that view is intentionally NOT proposed here.
-- GPA has no range check because scales vary (4.0 / 5.0 / percentage).

begin;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  nationality text,
  country_of_residence text,
  date_of_birth date,
  phone text,
  languages text[] not null default '{}',
  university text,
  faculty text,
  major text,
  academic_level text,
  graduation_year integer check (graduation_year is null or graduation_year between 1950 and 2100),
  gpa numeric(5,2),
  interests text[] not null default '{}',
  skills text[] not null default '{}',
  career_goals text,
  target_countries text[] not null default '{}',
  preferred_opportunity_types text[] not null default '{}',
  preferred_funding_types text[] not null default '{}',
  preferred_work_modes text[] not null default '{}',
  visibility text not null default 'private' check (visibility in ('private','members','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('work','internship','volunteering','leadership','project','research','publication','certification','competition','activity')),
  title text not null,
  organization text,
  description text,
  start_date date,
  end_date date,
  url text check (url is null or url ~* '^https?://'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index if not exists profile_entries_user_idx on public.profile_entries (user_id, kind);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.find_set_updated_at();
create trigger profile_entries_updated_at before update on public.profile_entries
  for each row execute function public.find_set_updated_at();

alter table public.profiles enable row level security;
alter table public.profile_entries enable row level security;
revoke all on public.profiles from anon;
revoke all on public.profile_entries from anon;

create policy "profiles owner select" on public.profiles for select to authenticated using (user_id = (select auth.uid()));
create policy "profiles owner insert" on public.profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy "profiles owner update" on public.profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "profiles owner delete" on public.profiles for delete to authenticated using (user_id = (select auth.uid()));

create policy "entries owner select" on public.profile_entries for select to authenticated using (user_id = (select auth.uid()));
create policy "entries owner insert" on public.profile_entries for insert to authenticated with check (user_id = (select auth.uid()));
create policy "entries owner update" on public.profile_entries for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "entries owner delete" on public.profile_entries for delete to authenticated using (user_id = (select auth.uid()));

commit;

-- ROLLBACK: drop table if exists public.profile_entries; drop table if exists public.profiles;
