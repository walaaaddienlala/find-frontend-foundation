# Find — Implementation Guide for the Team

Companion to `docs/FEATURE_STATUS.md` (generated) and `/admin/features` (live board).
**Rule:** a part is "implemented" only when it works against real data and has a test. Everything else here is scaffolding.

## 1. How the foundation works

| Piece | Where | Purpose |
|---|---|---|
| Feature registry | `lib/features/registry.ts` | Single source of truth: status per part, dependencies, acceptance criteria, files, tests, migration. Drives `/admin/features`, every scaffold page and `docs/FEATURE_STATUS.md`. |
| Scaffold pages | `components/features/feature-scaffold.tsx` + thin `app/**/page.tsx` | Honest placeholders. Read/write no data, `noindex`, enforce access. **Hidden in production** unless `NEXT_PUBLIC_ENABLE_SCAFFOLD_PAGES=true` (build-time flag; set it in preview environments). |
| Service layer | `lib/services/*.ts` | One interface per area. Stubs call the auth guard first, then return `not_configured`. Replace stub bodies, keep the guard. |
| Guards and results | `lib/services/guard.ts`, `result.ts` | `requireUser`, `requireAdmin` (same `has_role` call as the admin layout), `ServiceResult<T>` so UI renders empty/error/unauthorized states instead of throwing. |
| Models | `lib/models/*.ts` | Types mirroring the **proposed** tables. Nothing is verified against the live database. |
| Proposed migrations | `supabase/migrations-drafts/proposed/` | **Not applied.** See `000_README.md` for the approval gates. |
| Preflights | `supabase/migrations-drafts/phase2-*-preflight.sql` | Read-only. Run first; migrations are reconciled against the output. |
| Tests | `tests/scaffold-*.test.cjs` (`pnpm test:scaffold`) | Behaviour tests for pure logic + registry integrity (routes, files, migrations, RLS-on-every-table, no destructive SQL, no secrets, doc drift). |

Commands: `pnpm typecheck`, `pnpm test:phase1-all`, `pnpm docs:features` (regenerate status doc after editing the registry).

## 2. Graduating a scaffold into a real feature
1. Confirm the migration was approved and applied (staging first). Do not code against tables that do not exist.
2. Implement the service methods (keep the guard; scope every query by the signed-in user; validate input server-side; no `select('*')`).
3. Replace `FeatureScaffoldPage` in the route with the real page. Add loading/empty/error states (`components/shared/states.tsx`). **Do not add `loading.tsx` to auth-gated routes** (it streams a 200 before `redirect()` can send a 307).
4. Add tests (pure logic as in `tests/scaffold-core.test.cjs`; RLS tests with two disposable users on staging).
5. Update the registry (part statuses, `tests`), run `pnpm docs:features`, `pnpm typecheck`, `pnpm test:phase1-all`.
6. Only then add navigation links (`lib/site-config.ts`). Scaffolds are intentionally not linked.

## 3. Areas

### 1. Core hardening — *partial* (phase 0)
- **Done:** type/delivery mappers (`lib/opportunities/mappers.ts`), env helper and graceful degradation, debug route removal, explicit column list, `getOpportunitiesPage` (server-side pagination/search, sanitized), URL validation (increment 1).
- **Next:** switch `components/opportunities/opportunity-browser.tsx` to `getOpportunitiesPage` with URL params; add spec categories to the admin form + `opportunityTypes`; replace three inline funding-label copies with `lib/opportunities/labels.ts`; align `lib/types.ts` `ApplicationStatus` (UI) with `lib/data/applications.ts` (DB).
- **Blocked:** verification gate (001) and status alignment (009) on preflight output.
- **Acceptance:** see registry `core-hardening`.

### 2. Opportunity intelligence — *partial* (phase 3)
- **Done:** `/compare`, `/deadlines`, `/dashboard` (real data; rule-based, no AI).
- **Next:** compare entry points on cards/detail page; date-window filter in `getOpportunitiesPage`; start-date recommendation (needs checklist effort data); dashboard widgets as dependencies ship.
- **Depends on:** profile, documents, academy, notifications for the pending widgets.

### 3. Profiles and personalization — *scaffolded* (phase 3)
- **Files:** `lib/models/profile.ts`, `lib/services/profile.ts`, `app/profile`, migration `002`.
- **Steps:** approve 002 → form + server action → completion score (agree required fields with product first) → public view as an allow-listed DB view (never DOB/phone) → export.
- **Acceptance:** owner-only RLS; nothing inferred; export contains only the user's data.

### 4. Alerts and notifications — *scaffolded* (phase 3)
- **Files:** `lib/models/notification.ts`, `lib/services/notifications.ts`, `lib/notifications/{dedupe,delivery}.ts`, routes `/settings/notifications`, `/notifications`, `/alerts`, migration `003`.
- **Steps:** approve 003 → preferences UI → inbox UI → rule builder (fixed criteria schema, reuse opportunity filters) → evaluation job (idempotent via dedupe key) → email provider.
- **Blockers:** email provider choice; push/WhatsApp need provider + consent flow + compliance review.

### 5. Document vault — *scaffolded* (phase 5)
- **Files:** `lib/documents/policy.ts` (implemented), `lib/models/document.ts`, `lib/services/documents.ts`, `/documents`, migration `004`.
- **Steps:** approve 004 (creates a **private** bucket; assumes `applications.id` is uuid) → signed-URL upload/download actions (TTL from policy) → UI → per-application approval.
- **Blockers:** malware-scanning decision. Never log file contents; never use public URLs.

### 6. Find AI — *scaffolded* (phase 4+)
- **Files:** `lib/ai/{agents,guardrails,provider,audit}.ts`, `lib/models/ai.ts`, `lib/services/ai.ts`, `/ai`, `/ai/[agent]`, migration `005`.
- **Steps:** locate the hackathon MVP and decide merge vs rewrite → implement `AiProvider` (server-only keys) → rate limit + cost cap + audit → start with eligibility grounded in verified opportunity fields → matching, readiness, gap, roadmap.
- **Hard rules (tested):** no agent can submit an application; approval must match the exact final version; discovery agent cannot read user data.
- **Blockers:** provider/key management; verified opportunity data (gate 001); Application Agent also needs vault + approval UI + legal review.

### 7. Academy — *scaffolded* (phase 6)
- **Files:** `lib/models/academy.ts`, `lib/services/academy.ts`, `/academy`, `/academy/[slug]`, migration `006`.
- **Steps:** approve 006 → admin authoring → public catalog → enrollment/progress → certificates. Assessments/assignments are not yet modelled (product decision needed).

### 8. Community and mentors — *scaffolded* (phase 7)
- **Files:** `lib/models/community.ts`, `lib/services/community.ts`, `/community`, `/mentors`, `/success-stories`, migration `007`.
- **Steps:** moderation tooling and policy **before** opening posting; mentor verification workflow before listing; story review + consent before publishing. Never display unverified credentials or invented stories.
- **Open TODO:** mentor session status-transition rules (trigger).

### 9. Institutions — *scaffolded* (phase 9)
- **Files:** `lib/models/institution.ts`, `lib/services/institutions.ts`, `/institutions`, `/admin/institutions`, migration `008`.
- **Steps:** needs 001 first (audit log + gate) → onboarding + verification → publishing (still through the verification gate) → analytics.

### 10. Agent, chatbot and WhatsApp — *partial* (phases 3–4)
- **Done:** read-only grounded agent (`lib/agent/*`), `/api/chat`, flagged widget, WhatsApp webhook logic (unit-tested). See `docs/FIND_AI_AGENT_ARCHITECTURE.md`, `docs/FIND_CHATBOT_ARCHITECTURE.md`, `docs/WHATSAPP_INTEGRATION.md`.
- **Next:** conversations migration → persistent history; LLM phrasing layer (must not add facts); shared rate-limit store; browser E2E test; WhatsApp account linking + live verification.
- **Rule:** never add a write/submit tool without a registry entry, approval flow and tests.

### 11. Application transitions — *partial* (phase 1)
- **Done:** `lib/applications/transitions.ts`, server enforcement with optimistic concurrency, select shows only valid next statuses.
- **Blocked:** `ready_to_apply`, `under_review`, `withdrawn` and legacy-`saved` migration need migration 009 and preflight data.

## 4. Suggested parallel lanes
| Lane | Owns | Needs from others |
|---|---|---|
| A. Platform | core hardening, verification gate, status alignment, admin | preflight results |
| B. Personalization | profile, dashboard widgets, alerts | 002/003 approved |
| C. Documents + AI | vault, then Find AI agents | 004/005 approved, provider decision |
| D. Learning + community | academy, community, mentors, stories | 006/007 approved, moderation policy |
| E. Institutions | institutions, portals | lane A (gate), 008 |

**Merge-conflict hotspots:** `lib/features/registry.ts`, `lib/site-config.ts`, `app/admin/admin-sidebar.tsx`, `package.json`. Edit only your feature's entry; rebase often; run `pnpm docs:features`.

## 5. Open blockers and decisions
1. Run both preflights and return the output (gates 001, 009 and the `applications.id` assumption in 004).
2. Confirm `has_role` evaluates safely for `anon` and how roles beyond `admin` should work.
3. AI provider, key management, cost limits; location of the hackathon Find AI MVP.
4. Email/push/WhatsApp provider and consent flow.
5. Malware-scanning approach; moderation policy; mentor verification policy.
6. Migration owner/approver for each file.

## 6. Conventions and known issues (not changed here)
- The repo mixes CRLF and LF; keep each file's existing endings (add a `.gitattributes`).
- Pure, tested modules use **relative** imports (compiled by `tsconfig.test.json`); app code uses `@/`.
- Known, unchanged: funding labels duplicated in three components; `lib/types.ts` `ApplicationStatus` (UI) differs from the DB-aligned type; `saved` is still a writable application status; `/applications` redirects without `redirectTo`; stray 0-byte root files and `project-files.txt`; client components `auth-form`, application checklist/tasks create a Supabase client unguarded (route-specific, not in the global layout).
- Scaffold visibility is a **build-time** flag (`NEXT_PUBLIC_*`).

## 12. Frontend ecosystem (increment 4)
Every module has pages. See `docs/FRONTEND_ARCHITECTURE.md` (templates, honesty rules, how to add or graduate a page), `docs/FRONTEND_ROUTES_AND_MODULES.md` (generated page list and spec coverage map) and `docs/FRONTEND_BACKEND_REQUIREMENTS.md` (generated backend work per module + suggested API contract). To make a page real: build an **explicit** route (it wins over the catch-all), mark the registry entry `existing`, replace its sample collection with an API-backed source, then run `pnpm docs:frontend` and `pnpm test:ecosystem`.
