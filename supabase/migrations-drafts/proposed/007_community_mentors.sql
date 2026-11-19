-- ====================================================================
-- PROPOSED — NOT APPLIED. Do not run until the preflight output has been
-- reviewed, names are reconciled with the live schema, it has run cleanly on
-- staging, and a named owner has approved it. See 000_README.md.
-- ====================================================================
-- 007 Communities, mentors, success stories.
-- Membership checks use security definer helpers to avoid recursive RLS.
-- Moderation, mentor verification and story review run through security definer functions;
-- authors cannot change status columns directly (column-level grants).
-- TODO(policy): mentor_sessions allowed status transitions need a trigger once product rules are agreed.

begin;

create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  name text not null,
  description text not null default '',
  kind text not null check (kind in ('interest','goal','opportunity','career','university')),
  visibility text not null default 'public' check (visibility in ('public','members')),
  status text not null default 'active' check (status in ('active','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','moderator')),
  joined_at timestamptz not null default now(),
  primary key (community_id, user_id)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  community_id uuid not null references public.communities(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  body text not null check (char_length(body) <= 10000),
  status text not null default 'visible' check (status in ('visible','hidden','removed')),
  created_at timestamptz not null default now()
);
create index if not exists posts_community_idx on public.posts (community_id, created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  status text not null default 'visible' check (status in ('visible','hidden','removed')),
  created_at timestamptz not null default now()
);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('post','comment')),
  target_id uuid not null,
  reason text not null check (char_length(reason) between 1 and 1000),
  status text not null default 'open' check (status in ('open','reviewed','actioned','dismissed')),
  created_at timestamptz not null default now()
);

create table if not exists public.mentor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  headline text not null check (char_length(headline) <= 200),
  bio text not null default '' check (char_length(bio) <= 4000),
  fields text[] not null default '{}',
  languages text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','verified','suspended')),
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.mentor_sessions (
  id uuid primary key default gen_random_uuid(),
  mentor_id uuid not null references public.mentor_profiles(id) on delete cascade,
  mentee_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested','confirmed','completed','cancelled')),
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.success_stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  body text not null check (char_length(body) <= 20000),
  opportunity_id uuid references public.opportunities(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','pending_review','published','rejected')),
  evidence_note text,
  consented_at timestamptz,
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  check (status = 'draft' or consented_at is not null)
);

create or replace function public.is_community_member(p_community_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.community_members m where m.community_id = p_community_id and m.user_id = auth.uid())
$$;

create or replace function public.is_community_moderator(p_community_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.community_members m where m.community_id = p_community_id and m.user_id = auth.uid() and m.role = 'moderator')
$$;

alter table public.communities enable row level security;
alter table public.community_members enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.content_reports enable row level security;
alter table public.mentor_profiles enable row level security;
alter table public.mentor_sessions enable row level security;
alter table public.success_stories enable row level security;
revoke all on public.community_members, public.content_reports, public.mentor_sessions from anon;

-- communities
create policy "communities read" on public.communities for select to anon, authenticated
  using ((visibility = 'public' and status = 'active') or public.is_community_member(id) or public.has_role('admin'));
create policy "communities admin write" on public.communities for all to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- membership
create policy "members read" on public.community_members for select to authenticated
  using (user_id = (select auth.uid()) or public.is_community_member(community_id) or public.has_role('admin'));
create policy "members join" on public.community_members for insert to authenticated
  with check (user_id = (select auth.uid()) and role = 'member'
    and exists (select 1 from public.communities c where c.id = community_id and c.visibility = 'public' and c.status = 'active'));
create policy "members leave" on public.community_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.has_role('admin'));
create policy "members admin update" on public.community_members for update to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

-- posts and comments (authors edit text only; status changes via moderate_content)
create policy "posts read" on public.posts for select to anon, authenticated
  using (
    (status = 'visible' and exists (select 1 from public.communities c where c.id = community_id and c.visibility = 'public' and c.status = 'active'))
    or (status = 'visible' and public.is_community_member(community_id))
    or author_id = (select auth.uid()) or public.is_community_moderator(community_id) or public.has_role('admin')
  );
create policy "posts insert" on public.posts for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'visible' and public.is_community_member(community_id));
create policy "posts author update" on public.posts for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "posts author delete" on public.posts for delete to authenticated
  using (author_id = (select auth.uid()) or public.has_role('admin'));
revoke update on public.posts from authenticated;
grant update (title, body) on public.posts to authenticated;

create policy "comments read" on public.comments for select to anon, authenticated
  using (
    (status = 'visible' and exists (select 1 from public.posts p where p.id = post_id))
    or author_id = (select auth.uid()) or public.has_role('admin')
  );
create policy "comments insert" on public.comments for insert to authenticated
  with check (author_id = (select auth.uid()) and status = 'visible'
    and exists (select 1 from public.posts p where p.id = post_id and public.is_community_member(p.community_id)));
create policy "comments author update" on public.comments for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "comments author delete" on public.comments for delete to authenticated
  using (author_id = (select auth.uid()) or public.has_role('admin'));
revoke update on public.comments from authenticated;
grant update (body) on public.comments to authenticated;

-- reports
create policy "reports insert" on public.content_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()) and status = 'open');
create policy "reports read" on public.content_reports for select to authenticated
  using (reporter_id = (select auth.uid()) or public.has_role('admin'));
create policy "reports admin update" on public.content_reports for update to authenticated
  using (public.has_role('admin')) with check (public.has_role('admin'));

create or replace function public.moderate_content(p_target_type text, p_target_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_community uuid;
begin
  if p_status not in ('visible','hidden','removed') then
    raise exception 'invalid status';
  end if;

  if p_target_type = 'post' then
    select community_id into v_community from public.posts where id = p_target_id;
  elsif p_target_type = 'comment' then
    select p.community_id into v_community
    from public.comments c join public.posts p on p.id = c.post_id where c.id = p_target_id;
  else
    raise exception 'invalid target type';
  end if;

  if v_community is null then
    raise exception 'target not found';
  end if;

  if not (public.has_role('admin') or public.is_community_moderator(v_community)) then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_target_type = 'post' then
    update public.posts set status = p_status where id = p_target_id;
  else
    update public.comments set status = p_status where id = p_target_id;
  end if;
end $$;
revoke all on function public.moderate_content(text, uuid, text) from public;
grant execute on function public.moderate_content(text, uuid, text) to authenticated;

-- mentors (public listing only when verified; verification by admin function)
create policy "mentors read" on public.mentor_profiles for select to anon, authenticated
  using (status = 'verified' or user_id = (select auth.uid()) or public.has_role('admin'));
create policy "mentors apply" on public.mentor_profiles for insert to authenticated
  with check (user_id = (select auth.uid()) and status = 'pending');
create policy "mentors self update" on public.mentor_profiles for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke update on public.mentor_profiles from authenticated;
grant update (headline, bio, fields, languages) on public.mentor_profiles to authenticated;

create or replace function public.verify_mentor(p_mentor_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('admin') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_status not in ('pending','verified','suspended') then
    raise exception 'invalid status';
  end if;

  update public.mentor_profiles
  set status = p_status,
      verified_by = case when p_status = 'verified' then auth.uid() else null end,
      verified_at = case when p_status = 'verified' then now() else null end
  where id = p_mentor_id;
end $$;
revoke all on function public.verify_mentor(uuid, text) from public;
grant execute on function public.verify_mentor(uuid, text) to authenticated;

create policy "sessions participants read" on public.mentor_sessions for select to authenticated
  using (mentee_id = (select auth.uid())
    or exists (select 1 from public.mentor_profiles m where m.id = mentor_id and m.user_id = (select auth.uid())));
create policy "sessions request" on public.mentor_sessions for insert to authenticated
  with check (mentee_id = (select auth.uid()) and status = 'requested'
    and exists (select 1 from public.mentor_profiles m where m.id = mentor_id and m.status = 'verified'));
create policy "sessions participants update" on public.mentor_sessions for update to authenticated
  using (mentee_id = (select auth.uid())
    or exists (select 1 from public.mentor_profiles m where m.id = mentor_id and m.user_id = (select auth.uid())));
revoke update on public.mentor_sessions from authenticated;
grant update (status) on public.mentor_sessions to authenticated;

-- success stories (never public until reviewed)
create policy "stories read" on public.success_stories for select to anon, authenticated
  using (status = 'published' or author_id = (select auth.uid()) or public.has_role('admin'));
create policy "stories insert" on public.success_stories for insert to authenticated
  with check (author_id = (select auth.uid()) and status in ('draft','pending_review'));
create policy "stories author update" on public.success_stories for update to authenticated
  using (author_id = (select auth.uid()) and status in ('draft','rejected'))
  with check (author_id = (select auth.uid()) and status in ('draft','pending_review'));
create policy "stories author delete" on public.success_stories for delete to authenticated
  using (author_id = (select auth.uid()) and status in ('draft','rejected'));

create or replace function public.review_story(p_story_id uuid, p_status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('admin') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_status not in ('published','rejected') then
    raise exception 'invalid review status';
  end if;

  update public.success_stories
  set status = p_status, reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_story_id and status = 'pending_review';
end $$;
revoke all on function public.review_story(uuid, text) from public;
grant execute on function public.review_story(uuid, text) to authenticated;

commit;

-- ROLLBACK: drop functions review_story, verify_mentor, moderate_content, is_community_moderator, is_community_member; then drop tables success_stories, mentor_sessions, mentor_profiles, content_reports, comments, posts, community_members, communities.
