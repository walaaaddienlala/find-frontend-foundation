-- READ-ONLY preflight for the opportunity verification & publication gate.
-- Contains only SELECTs against catalogs / the opportunities table.
-- Run in the Supabase SQL editor, export every result set, and return them for
-- review BEFORE any executable migration is drafted. Do not paste secrets.

-- 1. Exact columns of public.opportunities (look for verification_* / reviewed_* / last_verified_*)
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = public and table_name = opportunities
order by ordinal_position;

-- 2. CHECK / UNIQUE / FK constraints (does verification_status already allow verified?)
select conname, contype, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = public.opportunities::regclass;

-- 3. Triggers on opportunities (anything already enforcing a publish gate?)
select tgname, pg_get_triggerdef(oid) as definition
from pg_trigger
where tgrelid = public.opportunities::regclass and not tgisinternal;

-- 4. RLS state and every policy on opportunities
select relrowsecurity as rls_enabled, relforcerowsecurity as rls_forced
from pg_class where oid = public.opportunities::regclass;

select policyname, roles, cmd, qual as using_expr, with_check as with_check_expr
from pg_policies where schemaname = public and tablename = opportunities;

-- 5. Table privileges for API roles
select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = public and table_name = opportunities
order by grantee, privilege_type;

-- 6. Definition of the has_role function the app relies on
select p.proname, pg_get_function_identity_arguments(p.oid) as args,
       p.prosecdef as security_definer, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = public and p.proname = has_role;

-- 7. Counts only (no row contents): publication x verification matrix
select status, verification_status, count(*) as n
from public.opportunities
group by 1, 2 order by 1, 2;

-- 8. Published-but-not-verified records (ids/titles only, for deliberate human review)
select id, title, provider, verification_status, published_at
from public.opportunities
where status = published and verification_status is distinct from verified
order by published_at;

-- 9. Published records whose deadline has already passed (expiry review queue)
select id, title, deadline
from public.opportunities
where status = published and deadline is not null and deadline < now()
order by deadline;
