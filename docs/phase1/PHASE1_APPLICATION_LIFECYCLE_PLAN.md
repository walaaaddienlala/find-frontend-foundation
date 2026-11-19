# Find Phase 1 — Application Lifecycle & Data Integrity

## Current verified frontend behavior

1. The current Save/Unsave UI stores bookmarks as `applications` rows with `status = 'saved'`.
2. A separate `saved_opportunities` table exists according to the previously recorded Supabase review, but the current frontend `getSavedOpportunities()` does not read it.
3. `getUserApplications()` first reads the user's application rows, then resolves their opportunity records through `getOpportunities()`. That function returns only `opportunities.status = 'published'`. The mapper drops any application whose opportunity is absent from that published-only result. Therefore an application tied to an unpublished/archived opportunity can disappear from the UI even though the application row still exists.
4. Checklist UI writes `applications.preparation_progress` separately after updating checklist items. A failure in the second write can leave the stored aggregate stale.
5. The application list currently derives its displayed preparation progress from checklist items only. Task completion is queried separately by the page and is not part of the same progress summary.

## Product/data model decision

Adopt two distinct concepts:

- **Bookmark:** a row in `saved_opportunities`; it means “I want to revisit this opportunity.”
- **Application:** a row in `applications`; it means “I am actively managing an application journey.”

A bookmark must never be represented as an application status long-term. Starting an application creates an `applications` row and must not silently erase the bookmark unless the product explicitly chooses that behavior.

## Safe migration sequence (not yet executed)

### A. Preflight

- Re-read current production schema, grants, RLS, unique constraints, FK definitions, and triggers for `saved_opportunities`, `applications`, and `opportunities`.
- Count duplicate bookmark pairs and inspect orphan references.
- Count legacy `applications.status = 'saved'` rows.
- Verify the exact `saved_opportunities` columns and unique constraint before writing SQL.
- Take a backup/export and prepare a rollback plan.

### B. Additive backfill

- Copy each legacy `applications` row with status `saved` into `saved_opportunities` using the verified column names.
- Use conflict-safe insertion against the verified unique key.
- Do not delete or mutate legacy application rows during the backfill.
- Compare counts and per-user/per-opportunity sets after backfill.

### C. Dual-read / dual-write compatibility

- Deploy a compatibility release that reads bookmarks from `saved_opportunities` and temporarily recognizes legacy saved-status rows where needed.
- New Save/Unsave actions should write/delete only bookmark rows, protected by owner RLS.
- Start Application should create an application row with a non-bookmark status and initialize checklist/tasks through the existing trusted DB mechanisms.
- Monitor errors and reconcile differences before retiring legacy behavior.

### D. Legacy cleanup (separate release)

- Only after verification and an explicit approval, remove legacy `applications.status = 'saved'` rows or migrate them to an archived representation if required by audit/history.
- Never run cleanup against production without a tested rollback and confirmed counts.

## Archived opportunity history

The current public opportunity read policy is published-only, based on the prior recorded security review. Do not weaken it to expose all unpublished opportunities publicly.

Preferred solution: add an owner-scoped, narrowly granted read path for opportunity metadata attached to the authenticated user's own application, or store an immutable opportunity snapshot on the application at creation time. The exact implementation depends on current schema and RLS. A SECURITY DEFINER function, if chosen, must have a fixed empty search_path, strict auth.uid() checks, minimal returned columns, and explicit grants; otherwise use a carefully designed RLS policy that checks ownership of the parent application.

The page should render a clearly labeled archived/unavailable opportunity snapshot, not hide the user's application history.

## Progress semantics

Keep these metrics separate:

- **Document readiness:** completed checklist documents / all checklist documents.
- **Task completion:** completed tasks / all active tasks.
- **Overall application progress:** do not invent an aggregate until product defines a documented weighting/formula. The existing `preparation_progress` column should not be treated as authoritative until its meaning is fixed and all writes use one trusted calculation path.

The helper added in this candidate computes the first two metrics independently. The Applications page now keeps document readiness separate from task completion. Checklist edits no longer write the duplicated `preparation_progress` aggregate from the client. This is a transitional safety measure, not a transactional database implementation.

## Phase 1 exit criteria

- Bookmark and application records are distinct in the data model and UI.
- Backfill reconciliation is exact, with no lost bookmarks or applications.
- Unpublished opportunity history remains visible only to its owner.
- Document readiness and task completion are independently correct.
- No stale aggregate can be written by competing client-side updates.
- RLS and integration tests pass with disposable accounts; the real HLI application is not used for destructive QA.
