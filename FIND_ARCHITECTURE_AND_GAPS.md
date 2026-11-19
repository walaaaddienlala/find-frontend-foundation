# Find — Architecture and Gaps

## 1. Current architecture (verified from code)

- **Framework:** Next.js 16.4.3 (App Router, webpack), React 19.3, TypeScript 5.7, Tailwind 4, shadcn + base-ui.
- **Auth/data:** Supabase (`@supabase/ssr`). Browser client (`lib/supabase/client.ts`) and cookie-based server client (`lib/supabase/server.ts`, `cache: no-store`). `proxy.ts` refreshes the session on every non-static request. Only the public URL and publishable key are used; no service-role key appears anywhere in code.
- **Authorization model:** per-action server checks. `requireAdmin()` = `auth.getUser()` + RPC `has_role(admin)` (admin layout and every admin action). User actions filter by `user_id = auth.uid()`; RLS is assumed as defence in depth but **not verifiable from the repo**.
- **Layering:** routes/server actions in `app/*`, data access in `lib/data/*`, pure logic in `lib/applications/*`, UI in `components/*`. Reasonable; business rules for opportunities live inside the admin action file (should move to `lib/`).
- **Pages (build output):** `/`, `/about`, `/how-it-works`, `/get-started`, `/sign-in`, `/opportunities`, `/opportunities/[id]`, `/saved`, `/applications`, `/auth/callback`, `/admin/*`, `/admin-check`, `/design-system`.

## 2. Highest-priority gaps

| Pri | Gap | Evidence | Impact |
|---|---|---|---|
| P0 | **No verification/publication gate** | `actions.ts` accepts `status=published` with any verification value; `verified` is not an allowed value; `/admin/verification` is a placeholder; public reads filter only `status=published` (`lib/data/opportunities.ts`) | Unverified data is publishable and indistinguishable to users; violates the core trust principle |
| P0 | **No schema/migrations in repo** | no `supabase/migrations/`; only read-only drafts | RLS, constraints and the gate cannot be reviewed, reproduced or tested |
| P1 | Tests are source-text regexes | `tests/*.test.cjs` read `.ts` files and `assert.match` | 24 passing tests prove code *shape*, not runtime behaviour, RLS or flows; no browser or DB tests |
| P1 | Silent data coercion | `mapOpportunityType` → `fellowship`; `mapWorkMode` default → `on-site` | Wrong categories/modes shown as fact |
| P1 | Scalability | `select *`, no pagination, client-side filtering | Breaks as opportunity count grows; also over-fetches columns |
| P1 | Root layout hard-crashes without env | `createClient()` throws; `/_not-found` prerender failed until placeholder env supplied | Fragile builds/previews; no graceful degradation |
| P2 | Legacy `saved` status still writable | `allowedStatuses` includes `saved`; UI offers it | Re-creates bookmark-as-application ambiguity |
| P2 | Status model narrower than spec | missing Planning, Ready for Review, Under Review, Withdrawn | Journey states cannot be represented |
| P2 | Admin pages beyond Opportunities are placeholders; no audit log; single `admin` role | `app/admin/{users,team,verification}` | No reviewer accountability |

## 3. Safely implementable now vs needs migration/service

- **Now, code-only:** input hardening, removing debug logging, status-model UI tweaks, type/mapper fixes, server-side pagination/search against existing columns, graceful env handling, more behavioural tests.
- **Needs migration (not applied; needs schema output + approval):** verification metadata (reviewer, `verified_at`, source checked, notes, history), DB-level publish gate trigger/constraint, audit log table, `profiles`, document vault tables, extra application statuses if a CHECK constraint exists.
- **Needs external service/decision:** AI provider and key management, file storage buckets/policies, email/notification provider, calendar sync, any automated submission (must respect CAPTCHA/MFA/ToS).

## 4. Repository hygiene (inspect, then decide — nothing deleted)

- `.env.local` was **inside the ZIP**. It is gitignored and contains only the public URL + publishable key (no service-role key seen), but it should not be shipped in archives. If it was ever shared beyond you, rotate the publishable key as a precaution.
- Three **0-byte stray files** at the repo root named like `setEmail(event.target.value)}` (accidental shell redirection from pasted JSX). Safe to delete; left untouched.
- `project-files.txt` is a 157,605-line Windows `tree` dump (includes node_modules paths). Now gitignored.
- `tsconfig.tsbuildinfo`, `.phase0-test-build/`, `.phase1-test-build/` are build artifacts; now gitignored. `lib/types.js` sits beside `lib/types.ts` (compiled output; confirm and remove).
- `lib/data/sample-opportunities.ts` + `isUsingSampleData = false` are leftovers; `/admin-check` is a debug route showing email and user ID to any signed-in user (own data only) and should be removed or admin-gated before launch.
- `package.json` name is `my-project`; `packageManager` pins `pnpm@12.3.4` while the sandbox resolved 12.16.1 — consider aligning.
- Mixed CRLF/LF line endings across files (noisy diffs). Add `.gitattributes`.

## 5. Status update — increment 2
**Resolved:** silent type/delivery coercion (mappers + tests); crash without Supabase env (header, mobile nav, data layer, admin layout, `/saved`, `/applications` now degrade; verified by a no-env build and runtime probes); `/admin-check` and `lib/types.js` removed; `select(*)` replaced by a compile-checked column list; server-side paginated/filtered query added.
**Still open:** verification/publication gate and status alignment (blocked on preflight); opportunity browser still filters client-side; funding labels duplicated three times; `auth-form` and application checklist/tasks create a Supabase client without an env guard (route-specific).
**New structure:** see `docs/FIND_IMPLEMENTATION_GUIDE.md`. Layers are now: `app/*` (routes) → `lib/services/*` (guarded interfaces, `ServiceResult`) → `lib/models/*` (types for proposed tables) → proposed migrations; pure logic lives in `lib/opportunities`, `lib/dashboard`, `lib/documents`, `lib/notifications`, `lib/ai` and is unit-tested.
