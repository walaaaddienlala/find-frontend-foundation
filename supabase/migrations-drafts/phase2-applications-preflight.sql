-- READ-ONLY preflight for application status alignment (proposal 009) and the
-- document/profile proposals that reference public.applications.
-- SELECT statements only. Run in the Supabase SQL editor and return all results.

-- 1. Columns of public.applications (confirm id type, status type, user_id)
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'applications'
order by ordinal_position;

-- 2. Constraints (is there a CHECK on status? what is it called and which values?)
select conname, contype, pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid = 'public.applications'::regclass;

-- 3. Counts by status (no row contents)
select status, count(*) as n from public.applications group by 1 order by 1;

-- 4. Policies and triggers on applications and related tables
select tablename, policyname, cmd, qual as using_expr, with_check as with_check_expr
from pg_policies
where schemaname = 'public'
  and tablename in ('applications','application_activity','application_checklist_items',
                    'application_tasks','application_links','saved_opportunities')
order by tablename, policyname;

select tgrelid::regclass as table_name, tgname, pg_get_triggerdef(oid) as definition
from pg_trigger
where tgrelid in ('public.applications'::regclass) and not tgisinternal;

-- 5. Do any proposed table names already exist? (all should return zero rows)
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in ('profiles','profile_entries','notification_preferences','alert_rules',
                     'notifications','documents','document_versions','application_documents',
                     'ai_audit_log','ai_memory','ai_usage_daily','courses','course_modules',
                     'lessons','enrollments','lesson_progress','certificates','communities',
                     'community_members','posts','comments','content_reports','mentor_profiles',
                     'mentor_sessions','success_stories','institutions','institution_members',
                     'opportunity_verifications','admin_audit_log');

-- 6. Do any proposed helper functions already exist? (all should return zero rows)
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and proname in ('find_set_updated_at','verify_opportunity','enforce_publication_gate',
                  'is_community_member','is_community_moderator','moderate_content',
                  'verify_mentor','review_story','is_institution_member','create_institution',
                  'set_institution_status','verify_certificate');
