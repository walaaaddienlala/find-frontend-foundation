-- FIND / Phase 1 — Bookmark migration preflight
-- READ-ONLY: this script performs catalog inspection and SELECTs only.
-- Run in Supabase SQL Editor against the intended project before drafting any migration.
-- Do not run destructive statements or use this as a migration.

-- -----------------------------------------------------------------------------
-- 1) Confirm table existence, columns, data types, nullability and defaults.
-- -----------------------------------------------------------------------------
select
  table_schema,
  table_name,
  ordinal_position,
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('applications', 'saved_opportunities', 'opportunities')
order by table_name, ordinal_position;

-- -----------------------------------------------------------------------------
-- 2) Inspect primary keys, unique constraints, checks and foreign keys.
-- -----------------------------------------------------------------------------
select
  ns.nspname as schema_name,
  tbl.relname as table_name,
  con.conname as constraint_name,
  case con.contype
    when 'p' then 'PRIMARY KEY'
    when 'u' then 'UNIQUE'
    when 'f' then 'FOREIGN KEY'
    when 'c' then 'CHECK'
    when 'x' then 'EXCLUSION'
    else con.contype::text
  end as constraint_type,
  pg_get_constraintdef(con.oid, true) as definition,
  con.convalidated as is_validated
from pg_constraint con
join pg_class tbl on tbl.oid = con.conrelid
join pg_namespace ns on ns.oid = tbl.relnamespace
where ns.nspname = 'public'
  and tbl.relname in ('applications', 'saved_opportunities', 'opportunities')
order by tbl.relname, constraint_type, con.conname;

-- -----------------------------------------------------------------------------
-- 3) Inspect indexes, including unique indexes not represented as constraints.
-- -----------------------------------------------------------------------------
select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('applications', 'saved_opportunities', 'opportunities')
order by tablename, indexname;

-- -----------------------------------------------------------------------------
-- 4) Inspect RLS state and policies. Check both USING and WITH CHECK expressions.
-- -----------------------------------------------------------------------------
select
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  p.policyname,
  p.permissive,
  p.roles,
  p.cmd,
  p.qual as using_expression,
  p.with_check as with_check_expression
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policies p
  on p.schemaname = n.nspname
 and p.tablename = c.relname
where n.nspname = 'public'
  and c.relname in ('applications', 'saved_opportunities', 'opportunities')
order by c.relname, p.policyname;

-- -----------------------------------------------------------------------------
-- 5) Inspect table privileges for API roles.
-- -----------------------------------------------------------------------------
select
  table_name,
  grantee,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('applications', 'saved_opportunities', 'opportunities')
  and grantee in ('anon', 'authenticated', 'service_role', 'postgres')
order by table_name, grantee, privilege_type;

-- -----------------------------------------------------------------------------
-- 6) Inspect triggers and trigger functions attached to the three tables.
-- -----------------------------------------------------------------------------
select
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_get_triggerdef(t.oid, true) as trigger_definition,
  pn.nspname as function_schema,
  p.proname as function_name,
  pg_get_userbyid(p.proowner) as function_owner,
  p.prosecdef as security_definer,
  p.proconfig as function_settings
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
join pg_namespace pn on pn.oid = p.pronamespace
where not t.tgisinternal
  and n.nspname = 'public'
  and c.relname in ('applications', 'saved_opportunities', 'opportunities')
order by c.relname, t.tgname;

-- -----------------------------------------------------------------------------
-- 7) Legacy saved-row counts and status distribution.
-- This relies only on the already observed applications columns.
-- -----------------------------------------------------------------------------
select
  status,
  count(*) as row_count
from public.applications
group by status
order by status;

select
  count(*) as legacy_saved_rows,
  count(distinct (user_id, opportunity_id)) as distinct_legacy_pairs,
  count(*) - count(distinct (user_id, opportunity_id)) as duplicate_legacy_pairs
from public.applications
where status = 'saved';

-- -----------------------------------------------------------------------------
-- 8) Bookmark-table row count and duplicate pairs.
-- This query intentionally assumes the conventional columns only after Query 1
-- confirms they exist. If they do not, DO NOT run this query; report the schema.
-- -----------------------------------------------------------------------------
select
  count(*) as bookmark_rows,
  count(distinct (user_id, opportunity_id)) as distinct_bookmark_pairs,
  count(*) - count(distinct (user_id, opportunity_id)) as duplicate_bookmark_pairs
from public.saved_opportunities;

-- -----------------------------------------------------------------------------
-- 9) Orphan references in each source. Run only after Query 1 confirms columns.
-- -----------------------------------------------------------------------------
select 'legacy_applications_saved' as source, count(*) as orphan_rows
from public.applications a
left join public.opportunities o on o.id = a.opportunity_id
where a.status = 'saved' and o.id is null
union all
select 'saved_opportunities' as source, count(*) as orphan_rows
from public.saved_opportunities s
left join public.opportunities o on o.id = s.opportunity_id
where o.id is null;

-- -----------------------------------------------------------------------------
-- 10) Per-user/per-opportunity reconciliation preview.
-- No writes. Shows pairs present in either source and where they came from.
-- -----------------------------------------------------------------------------
with legacy as (
  select user_id, opportunity_id, count(*) as legacy_count
  from public.applications
  where status = 'saved'
  group by user_id, opportunity_id
), current_bookmarks as (
  select user_id, opportunity_id, count(*) as bookmark_count
  from public.saved_opportunities
  group by user_id, opportunity_id
)
select
  coalesce(l.user_id, b.user_id) as user_id,
  coalesce(l.opportunity_id, b.opportunity_id) as opportunity_id,
  coalesce(l.legacy_count, 0) as legacy_count,
  coalesce(b.bookmark_count, 0) as bookmark_count,
  case
    when l.user_id is not null and b.user_id is not null then 'present_in_both'
    when l.user_id is not null then 'legacy_only'
    else 'bookmark_table_only'
  end as reconciliation_state
from legacy l
full outer join current_bookmarks b
  on b.user_id = l.user_id
 and b.opportunity_id = l.opportunity_id
order by reconciliation_state, user_id, opportunity_id;
