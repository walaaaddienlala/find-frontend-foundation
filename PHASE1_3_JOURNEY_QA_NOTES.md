# Find Phase 1.3 — End-to-End Journey QA Notes

## Scope
Source-level integration regression checks for the opportunity-to-application journey:

1. Save/unsave opportunity bookmarks.
2. Start application tracking for a published opportunity.
3. View the signed-in user's applications.
4. Add/update/remove checklist documents scoped to an application and user.
5. Keep document readiness separate from task completion.
6. Keep internal tracking separate from the external Apply Now link.

## Results

| Suite | Passed | Failed |
|---|---:|---:|
| Phase 0 safety | 3 | 0 |
| Phase 1 progress/history | 4 | 0 |
| Bookmark/application-start regression | 6 | 0 |
| Phase 1.3 journey integration checks | 8 | 0 |
| **Total** | **21** | **0** |

Run commands:

```bash
npm run test:phase0
npm run test:phase1
npm run test:phase1-bookmarks
npm run test:phase1-journey
```

## Limitations / not yet verified

- These are Node regression tests and source-level integration assertions, not real browser-driven E2E tests.
- No live Supabase writes or reads were performed.
- No Next.js production build or browser session was run because project dependencies are not installed in this isolated workspace.
- No database migration was run.
- The existing user's `in_progress` application was not accessed or modified by these tests.

## Safety invariants checked

- Bookmark mutations target `saved_opportunities`, not `applications`.
- Starting tracking inserts a `preparing` application and returns an existing record without resetting its state.
- Checklist operations are scoped by `application_id` and authenticated `user_id`.
- Checklist/document readiness and application task completion remain distinct metrics.
- Checklist and bookmark paths do not delete application records.
