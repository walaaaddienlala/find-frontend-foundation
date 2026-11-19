# Find Phase 1 — Bookmark migration preflight

## Purpose

This is the next controlled step toward separating a lightweight bookmark from an actual application:

- Legacy bookmark: `applications` row with `status = 'saved'`.
- Intended bookmark: row in `saved_opportunities`.
- Actual application: `applications` row with a non-`saved` lifecycle status.

## Current status

**No migration has been run.** The supplied frontend archive does not include authoritative schema migration files. The previously recorded security review confirms that a `saved_opportunities` table and owner-scoped policies existed at that time, but it does not establish the current exact column definitions, constraints, grants, triggers, or policy expressions.

The SQL file `supabase/migrations-drafts/phase1-bookmark-preflight.sql` is a read-only inspection script. It contains no INSERT, UPDATE, DELETE, TRUNCATE, ALTER, DROP, or CREATE statements.

## How to run safely

1. Open the Supabase SQL Editor for the intended project.
2. Run queries 1–7 first. Query 1 must confirm the columns assumed by later queries.
3. If `saved_opportunities` has `user_id` and `opportunity_id`, run queries 8–10.
4. Save/export all result sets. Do not paste credentials or service-role keys.
5. Return the result sets for review before any executable migration is drafted.

If the table or column names differ, stop after the catalog inspection. Do not modify the SQL to guess a schema.

## Required checks before migration

- Both tables' exact columns, types, nullability and defaults.
- Unique constraint/index for `(user_id, opportunity_id)` on bookmarks.
- Foreign-key behavior for user and opportunity references.
- RLS enabled/forced state, policies, roles, commands, `USING` and `WITH CHECK` expressions.
- API grants for `anon`, `authenticated`, and `service_role`.
- Triggers and functions that may create or mutate related rows.
- Legacy saved-row counts, duplicate pairs, bookmark-table counts and duplicate pairs.
- Orphan opportunity references.
- Per-user/per-opportunity reconciliation showing legacy-only, table-only and both.

## Migration design after preflight

The migration should be additive and reversible:

1. Back up/export relevant rows.
2. Insert missing legacy pairs into `saved_opportunities` using the verified unique key and conflict-safe behavior.
3. Compare pair sets, not just total counts.
4. Deploy code that reads/writes the bookmark table while retaining a temporary compatibility read for legacy rows if needed.
5. Verify with disposable accounts and real user data read-only.
6. Only after a separate approval, plan cleanup of legacy `status = 'saved'` application rows.

Do not delete or rewrite any legacy rows in the backfill migration. Do not touch the known HLI application record during QA.

## Acceptance criteria

- Every legacy saved pair exists in the bookmark table after backfill.
- No duplicate bookmark pair exists.
- No orphan reference is introduced.
- Bookmark RLS allows only the owner to read/insert/delete their own rows.
- Saving or unsaving a bookmark never creates or deletes an application row.
- Starting an application creates the application lifecycle record and does not silently lose the bookmark unless that behavior is explicitly selected.
- Archived/unpublished opportunity visibility remains owner-scoped; public opportunity RLS is not weakened.
