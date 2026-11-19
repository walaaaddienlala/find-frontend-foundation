# Proposed migrations (NOT APPLIED)

Nothing in this folder has been run. These are **proposals** written from what the
application code references; none were validated against the live schema.

## Approval process (separate gates)
1. **Preflight** – run `../phase2-verification-preflight.sql` and `../phase2-applications-preflight.sql` (read-only). Return the output.
2. **Reconcile** – compare output with each proposal: column names, constraint names, `has_role` signature, `applications.id` type, existing tables/functions with the same names.
3. **Staging** – apply to a staging/branch Supabase project first; run RLS tests with two disposable users.
4. **Approval** – a named owner approves each file individually.
5. **Production** – apply one file at a time, in numeric order, after a backup/PITR point.

## Files and order
| File | Area | Depends on |
|---|---|---|
| 001_verification_gate.sql | Verification + publish gate + audit log | preflight (opportunities) |
| 002_profiles.sql | Profiles | – |
| 003_notifications.sql | Preferences, alert rules, notifications | – |
| 004_documents.sql | Document vault + private bucket | `applications.id` type (preflight) |
| 005_ai.sql | AI audit, memory, usage | – |
| 006_academy.sql | Courses, progress, certificates | 001 (`has_role` usage) |
| 007_community_mentors.sql | Communities, mentors, stories | 002 |
| 008_institutions.sql | Institutions (+ nullable `opportunities.institution_id`) | 001 |
| 009_application_status_alignment.sql | Template only (no executable SQL) | applications preflight |

## Conventions
- Additive only. No drops, no data rewrites. Existing published-but-unverified rows are **not** modified by 001.
- Every table has RLS enabled; `anon` has no access to private tables.
- Privileged writes go through `security definer` functions with `set search_path = public`.
- Roles other than `admin` (mentor, reviewer, institution roles) are **not assumed** to exist in `has_role`; institution roles live in `institution_members`.
- Each file ends with a commented ROLLBACK section.

## Known assumptions to verify
`has_role` accepts the literal `'admin'`; `public.opportunities.id` is `uuid`; `public.applications.id` is `uuid` and has `user_id`; extension `pgcrypto`/`gen_random_uuid()` is available (default on Supabase).
`has_role('admin')` must evaluate to false (not raise) for `anon`, because proposals 006, 007 and 008 call it inside policies that also apply to anonymous readers. Syntax of every file was checked with a PostgreSQL parser only; **no file has been executed**.
