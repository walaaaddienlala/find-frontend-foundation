-- ====================================================================
-- PROPOSED — NOT APPLIED. Do not run until the preflight output has been
-- reviewed, names are reconciled with the live schema, it has run cleanly on
-- staging, and a named owner has approved it. See 000_README.md.
-- ====================================================================
-- 005 AI audit, memory and usage. Audit and usage rows are server-written only.
-- input_summary must already be redacted (lib/ai/audit.ts); never store raw document content.

begin;

create table if not exists public.ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent text not null,
  action text not null,
  status text not null check (status in ('ok','refused','error')),
  model text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  input_summary text check (input_summary is null or char_length(input_summary) <= 300),
  created_at timestamptz not null default now()
);
create index if not exists ai_audit_log_user_idx on public.ai_audit_log (user_id, created_at desc);

create table if not exists public.ai_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (char_length(key) between 1 and 80),
  value text not null check (char_length(value) <= 1000),
  source text not null check (source in ('user_entered','user_approved_suggestion')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, key)
);

create table if not exists public.ai_usage_daily (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  requests integer not null default 0,
  tokens bigint not null default 0,
  primary key (user_id, day)
);

create trigger ai_memory_updated_at before update on public.ai_memory
  for each row execute function public.find_set_updated_at();

alter table public.ai_audit_log enable row level security;
alter table public.ai_memory enable row level security;
alter table public.ai_usage_daily enable row level security;
revoke all on public.ai_audit_log, public.ai_memory, public.ai_usage_daily from anon;

create policy "ai audit owner select" on public.ai_audit_log for select to authenticated using (user_id = (select auth.uid()));
create policy "ai usage owner select" on public.ai_usage_daily for select to authenticated using (user_id = (select auth.uid()));
create policy "ai memory owner all" on public.ai_memory for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke insert, update, delete on public.ai_audit_log, public.ai_usage_daily from authenticated;

commit;

-- ROLLBACK: drop table if exists public.ai_usage_daily; drop table if exists public.ai_memory; drop table if exists public.ai_audit_log;
