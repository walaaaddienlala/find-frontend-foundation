# Phase 1 — Bookmark Architecture Implementation

## Implemented in the isolated candidate

- `getSavedOpportunities()` now reads bookmark IDs from `public.saved_opportunities`.
- Saved opportunity cards are resolved against the currently public opportunity list; no bookmark record is stored in `applications`.
- `SaveOpportunityButton` checks, inserts, and deletes rows only in `saved_opportunities`.
- Bookmark state is independent of application state. A user can save an opportunity even when an application for that opportunity already exists.
- Unsave can no longer delete an `applications` row because the bookmark UI does not issue mutations against that table.
- Duplicate concurrent bookmark inserts are handled by checking the authoritative row after an insert error.

## Database / production safety

- No SQL migration was executed.
- No production database was accessed or modified during this code change.
- The one known existing application (`in_progress`) was not read or changed by any migration or script.
- Existing `applications.status = 'saved'` compatibility remains in the schema and legacy type/status definitions for now. No status constraint/default change is included.
- The current public opportunity resolver still omits saved opportunities that are no longer publicly visible. Preserving historical bookmark cards would require a separate owner-scoped opportunity read or snapshot design and is not included here.

## Verification

- Added `tests/phase1-bookmarks.test.cjs` to guard the separation between bookmark and application persistence.
- Full app typecheck/build and live Supabase integration tests still need to run in an environment with dependencies and configured Supabase credentials.

## Start Application tracking flow (next increment)

- Added `startApplicationAction(opportunityId)` as an authenticated server action.
- The action accepts only a UUID-shaped opportunity ID and verifies that the opportunity is currently published.
- It checks for an existing `(user_id, opportunity_id)` application before inserting.
- New application tracking rows are created with `status = 'preparing'` and `preparation_progress = 0`.
- Existing application rows are returned unchanged; the action never updates or deletes an existing application.
- The database unique constraint remains the final concurrency guard. If a concurrent insert wins, the action re-reads and returns the existing row.
- The opportunity detail page now presents application tracking separately from the external `Apply Now` link. Starting tracking does not claim that the user submitted an application to the provider.

## Additional verification

- Phase 0 focused tests: 3 passed.
- Phase 1 progress/history focused tests: 4 passed.
- Bookmark + application-start regression tests: 6 passed.
- Total focused tests: 13 passed.
- Full Next.js typecheck/build and browser/live Supabase integration tests remain unrun because dependencies are not installed and no disposable Supabase test environment is configured in this workspace.
