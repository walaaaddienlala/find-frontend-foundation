# Find Phase 0 — Safety Candidate QA Record

## Scope
This is an isolated candidate based on the supplied Find frontend archive. No production database, Supabase project, real user application, or deployment was accessed or modified during this verification pass.

## Safety changes present in candidate
- Save state distinguishes `applications.status = 'saved'` from a non-saved application.
- Unsave issues a DELETE filtered by authenticated `user_id`, `opportunity_id`, and `status = 'saved'`.
- If the guarded DELETE affects no rows, the component re-reads the current status instead of assuming deletion succeeded.
- Unknown/read-error state fails closed in the UI.
- Signed-out save redirects to the opportunity route after sign-in.
- Sign-up confirmation carries a `next` destination to the auth callback.
- Sign In / Get Started switch carries `redirectTo`.
- Both client auth flow and callback use a same-origin relative-path validator.

## Verification performed in this environment

### Passed
Command: `npm run test:phase0`
- TypeScript compilation of the two pure helper modules: passed.
- Node test runner: 3 tests passed, 0 failed.
- Covered saved-only unsave eligibility, all currently known non-saved statuses plus unknown values, preservation of a local opportunity route including query/hash, and rejection of external/malformed destinations.

### Blocked by missing dependencies
Command: `npm run typecheck`
- Could not complete because `node_modules` is absent. The compiler reports missing Next.js, React, Supabase, and other package declarations. Result is inconclusive, not a confirmed application-source type error.

Command: `npm run build`
- Could not start because the `next` executable is not installed (`next: not found`).

### Not performed
- Browser/Playwright tests.
- Supabase integration tests or authenticated database mutation tests.
- Supabase Auth dashboard allowed-redirect configuration review.
- Production deployment.

## Important implementation boundary
The candidate retains the current application-backed saved-opportunity model (`applications.status = 'saved'`). It does not migrate bookmarks to `saved_opportunities`. That lifecycle decision belongs to Phase 1 and requires a separate compatibility/data migration plan.

## Safety constraints
- Never use the real HLI application record for destructive tests.
- Use disposable test users and records in a non-production Supabase environment for integration QA.
- Keep this candidate on a development branch until full dependency installation, build, typecheck, browser, and integration checks pass.
