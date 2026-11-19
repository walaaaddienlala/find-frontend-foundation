# Find Phase 1 — Lifecycle, Data Integrity & Bookmark Architecture QA

## Implemented in this isolated candidate

### Application lifecycle
- Added `lib/applications/progress.ts` to calculate document readiness and task completion as separate metrics.
- Added `lib/applications/opportunity-history.ts` to create a safe, minimal placeholder when an owned application references an opportunity absent from the published-only public query. The placeholder does not expose stale external URLs.
- Updated `getUserApplications()` so it no longer drops an application row merely because the related opportunity is not publicly published.
- Updated the Applications page to label unavailable opportunities and avoid linking to a dead public detail page.
- Removed client-side writes to the duplicated `applications.preparation_progress` aggregate from checklist item changes. Checklist state remains the source for document readiness; task completion remains separate.
- Removed the hidden preparation-progress form field and stopped writing that aggregate when changing application status.

### Bookmark architecture
- `getSavedOpportunities()` now reads bookmark IDs from `saved_opportunities`.
- `SaveOpportunityButton` checks, inserts, and deletes only `saved_opportunities` rows.
- Bookmark state is independent of application state; the presence of an application no longer blocks a bookmark action.
- Unsave no longer issues a delete against `applications`.
- Concurrent duplicate insert attempts are reconciled by re-reading the authoritative bookmark row.
- Added static regression tests that assert the bookmark data path remains separate from `applications`.

## Verification performed in this workspace
- Phase 0 safety tests: **3 passed, 0 failed**.
- Phase 1 lifecycle tests: **4 passed, 0 failed**.
- Bookmark architecture regression tests: **3 passed, 0 failed**.
- Total focused tests: **10 passed, 0 failed**.
- TypeScript compilation passed for the isolated pure helper modules used by the Phase 0/1 tests.

## Not verified / limitations
- Full Next.js build and full application typecheck have not been run because project dependencies are not installed in this isolated workspace.
- No browser/E2E or live Supabase integration test was run.
- No SQL migration was executed and no production database was accessed or modified during this implementation.
- Existing `applications.status = 'saved'` remains in the schema/status compatibility layer for now; no status CHECK/default change is included.
- The saved page resolves bookmarks against the currently public opportunity list. Preserving cards for unpublished/archived opportunities needs a separate owner-scoped read or snapshot design.
- The unavailable application-history placeholder preserves the application row and reference, but does not recover the original opportunity title or metadata.
- The known existing `in_progress` application was not changed.
