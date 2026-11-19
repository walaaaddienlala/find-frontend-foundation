-- ====================================================================
-- PROPOSED — NOT APPLIED. Do not run until the preflight output has been
-- reviewed, names are reconciled with the live schema, it has run cleanly on
-- staging, and a named owner has approved it. See 000_README.md.
-- ====================================================================
-- 003 Notification preferences, alert rules, notifications.
-- Notification rows are inserted server-side only (no insert policy for authenticated).
-- Users may read their rows and update read_at only (column-level grant).

begin;

create table if not exists public.notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  channel text not null check (channel in ('in_app','email','push','whatsapp')),
  category text not null check (category in ('matching_opportunities','deadlines','saved_updates','application_status','missing_documents','learning','mentor_messages','community_replies','events','ai_recommendations')),
  enabled boolean not null default false,
  consented_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, channel, category),
  check (channel not in ('push','whatsapp') or enabled = false or consented_at is not null)
);

create table if not exists public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  criteria jsonb not null default '{}'::jsonb,
  channels text[] not null default '{in_app}',
  active boolean not null default true,
  last_evaluated_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists alert_rules_user_idx on public.alert_rules (user_id) where active;

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  body text not null,
  entity_type text,
  entity_id text,
  dedupe_key text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, dedupe_key)
);
create index if not exists notifications_user_unread_idx on public.notifications (user_id, created_at desc) where read_at is null;

create trigger notification_preferences_updated_at before update on public.notification_preferences
  for each row execute function public.find_set_updated_at();

alter table public.notification_preferences enable row level security;
alter table public.alert_rules enable row level security;
alter table public.notifications enable row level security;
revoke all on public.notification_preferences, public.alert_rules, public.notifications from anon;

create policy "prefs owner all" on public.notification_preferences for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "rules owner all" on public.alert_rules for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "notifications owner select" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "notifications owner update" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "notifications owner delete" on public.notifications for delete to authenticated using (user_id = (select auth.uid()));

revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

commit;

-- ROLLBACK: drop table if exists public.notifications; drop table if exists public.alert_rules; drop table if exists public.notification_preferences;
