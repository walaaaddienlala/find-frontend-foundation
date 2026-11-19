# Phase 1.2 — Checklist Integration Preflight and QA

## Supabase schema confirmed by the project owner

`public.application_checklist_items` contains:
- `id` UUID primary key with `gen_random_uuid()` default
- `application_id` UUID, foreign key to `applications(id)` with `ON DELETE CASCADE`
- `user_id` UUID, foreign key to `auth.users(id)` with `ON DELETE CASCADE`
- `document_name` non-null text
- `status` non-null text defaulting to `missing`
- `notes` nullable text
- `sort_order` non-null integer defaulting to `0`
- `created_at` and `updated_at` timestamps defaulting to `now()`

Constraints confirmed:
- non-empty trimmed `document_name`
- `status` restricted to `missing`, `in_progress`, `done`
- unique `(application_id, document_name)`
- FK from checklist item to application and user

RLS policies confirmed:
- SELECT, INSERT, UPDATE, DELETE are scoped to `auth.uid()` and verify ownership of the parent application.

Effective privileges confirmed by the owner using `has_table_privilege`:
- authenticated SELECT = true
- authenticated INSERT = true
- authenticated UPDATE = true
- authenticated DELETE = true

## Implementation contract

- Checklist items are the source of truth for document readiness.
- Document readiness is `round(done_items / all_items * 100)`; empty checklist = 0%.
- Task completion remains a separate metric and is not merged with document readiness.
- Checklist writes are scoped by item ID, application ID, and authenticated user ID.
- The application lifecycle row is separate from bookmarks.
- Starting tracking uses `preparing`; existing `(user_id, opportunity_id)` rows are returned unchanged.
- No SQL migration is required for the confirmed checklist schema.

## QA performed in this workspace

Commands run successfully:
- `npm run test:phase0` — 3 passed
- `npm run test:phase1` — 4 passed
- `npm run test:phase1-bookmarks` — 6 passed

Total focused tests: 13 passed, 0 failed.

The Phase 1 test imports were corrected to match TypeScript's actual emitted directory structure (`applications/progress.js` and `applications/opportunity-history.js`).

## Not performed

- No production SQL migration or data mutation.
- No live Supabase integration test.
- No full Next.js build/typecheck or browser/E2E test; dependencies are not installed in this workspace.
- No existing application row was changed.
