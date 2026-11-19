-- ====================================================================
-- PROPOSED — NOT APPLIED. Do not run until the preflight output has been
-- reviewed, names are reconciled with the live schema, it has run cleanly on
-- staging, and a named owner has approved it. See 000_README.md.
-- ====================================================================
-- 001 Verification and publication gate
-- Assumes (from app code): public.opportunities(id uuid, status text, verification_status text,
-- deadline, application_url, official_source_url, eligibility). The CHECK on
-- verification_status must already allow 'verified' (preflight query 2); if not, extend it first.
-- Existing published-but-unverified rows are grandfathered: they stay published and editable,
-- and are listed by preflight query 8 for deliberate human review.

begin;

create or replace function public.find_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

alter table public.opportunities
  add column if not exists verified_at timestamptz,
  add column if not exists verified_by uuid references auth.users(id),
  add column if not exists last_verified_source_url text;

create table if not exists public.opportunity_verifications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id),
  from_status text,
  to_status text not null,
  source_url text not null,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists opportunity_verifications_opportunity_idx
  on public.opportunity_verifications (opportunity_id, created_at desc);

alter table public.opportunity_verifications enable row level security;
revoke all on public.opportunity_verifications from anon;

create policy "admins read verification history"
  on public.opportunity_verifications for select to authenticated
  using (public.has_role('admin'));
-- No insert/update/delete policy: rows are written only by verify_opportunity().

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.admin_audit_log enable row level security;
revoke all on public.admin_audit_log from anon;

create policy "admins read audit log"
  on public.admin_audit_log for select to authenticated
  using (public.has_role('admin'));

-- Only path that can set verification_status = 'verified'.
create or replace function public.verify_opportunity(
  p_opportunity_id uuid,
  p_status text,
  p_source_url text,
  p_notes text default null
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_old text;
begin
  if not public.has_role('admin') then
    raise exception 'not authorized' using errcode = '42501';
  end if;

  if p_source_url is null or btrim(p_source_url) = '' then
    raise exception 'the official source that was checked is required';
  end if;

  select verification_status into v_old
  from public.opportunities where id = p_opportunity_id for update;

  if not found then
    raise exception 'opportunity not found';
  end if;

  perform set_config('find.verifying', 'on', true);

  update public.opportunities
  set verification_status = p_status,
      verified_at = case when p_status = 'verified' then now() else null end,
      verified_by = case when p_status = 'verified' then auth.uid() else null end,
      last_verified_source_url = p_source_url
  where id = p_opportunity_id;

  insert into public.opportunity_verifications
    (opportunity_id, reviewer_id, from_status, to_status, source_url, notes)
  values
    (p_opportunity_id, auth.uid(), v_old, p_status, p_source_url, p_notes);

  insert into public.admin_audit_log (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), 'opportunity.verification', 'opportunity', p_opportunity_id::text,
          jsonb_build_object('from', v_old, 'to', p_status));
end $$;

revoke all on function public.verify_opportunity(uuid, text, text, text) from public;
grant execute on function public.verify_opportunity(uuid, text, text, text) to authenticated;

-- Publication gate + change detection.
create or replace function public.enforce_publication_gate()
returns trigger language plpgsql as $$
declare
  v_verifying boolean := coalesce(current_setting('find.verifying', true), '') = 'on';
begin
  -- 1. 'verified' can only be set through verify_opportunity().
  if new.verification_status = 'verified'
     and (tg_op = 'INSERT' or old.verification_status is distinct from 'verified')
     and not v_verifying then
    raise exception 'verification_status can only be set to verified through verify_opportunity()'
      using errcode = '42501';
  end if;

  -- 2. Newly published rows must be verified (already-published rows are grandfathered).
  if new.status = 'published'
     and new.verification_status is distinct from 'verified'
     and (tg_op = 'INSERT' or old.status is distinct from 'published') then
    raise exception 'an opportunity must be verified before it can be published'
      using errcode = '23514';
  end if;

  -- 3. Material changes to a verified row send it back for review.
  if tg_op = 'UPDATE'
     and old.verification_status = 'verified'
     and not v_verifying
     and (new.deadline is distinct from old.deadline
          or new.application_url is distinct from old.application_url
          or new.official_source_url is distinct from old.official_source_url
          or new.eligibility is distinct from old.eligibility) then
    new.verification_status := 'needs_update';
  end if;

  return new;
end $$;

drop trigger if exists opportunities_publication_gate on public.opportunities;
create trigger opportunities_publication_gate
  before insert or update on public.opportunities
  for each row execute function public.enforce_publication_gate();

commit;

-- ROLLBACK (manual, only if required):
-- drop trigger if exists opportunities_publication_gate on public.opportunities;
-- drop function if exists public.enforce_publication_gate();
-- drop function if exists public.verify_opportunity(uuid, text, text, text);
-- drop table if exists public.opportunity_verifications;
-- drop table if exists public.admin_audit_log;
-- alter table public.opportunities drop column if exists verified_at, drop column if exists verified_by, drop column if exists last_verified_source_url;
