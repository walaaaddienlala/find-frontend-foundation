# Find Phase 1 — Bookmark, application-start, and checklist integration status

Implemented in the isolated candidate:

- Bookmark reads/writes use `saved_opportunities` only.
- Unsave cannot mutate or delete an `applications` row.
- Starting application tracking is a separate authenticated server action.
- New tracking rows use `preparing` with `preparation_progress = 0`.
- Existing application rows are returned unchanged; the action is idempotent for the unique user/opportunity pair.
- The opportunity detail page distinguishes starting Find tracking from opening the provider's external application form.
- Application checklist CRUD is scoped by application and user; checklist statuses match the database CHECK constraint.
- Document readiness is calculated from checklist items; task completion remains a separate metric.
- Saved application history can retain an unavailable/unpublished opportunity reference without exposing stale application URLs.
- Focused test import paths were corrected to match compiler output.

Verification completed in this workspace:

- Phase 0 focused tests: 3 passed.
- Phase 1 progress/history focused tests: 4 passed.
- Bookmark/application-start regression tests: 6 passed.
- Total focused tests: 13 passed, 0 failed.
- Owner-provided Supabase preflight confirms authenticated SELECT/INSERT/UPDATE/DELETE privileges on `application_checklist_items`.
- Owner-provided schema/constraint/RLS output confirms checklist ownership checks, allowed statuses, and uniqueness of `(application_id, document_name)`.

Not completed / not claimed:

- No production SQL migration was executed.
- No production Supabase records were read or modified by this implementation pass.
- Full Next.js typecheck/build and browser/E2E tests were not run because project dependencies are not installed in this workspace.
- Live Supabase integration tests were not run because no disposable test project/account is configured.
- The user's existing `in_progress` application was not touched by this code change.
