# Find — Feature Inventory

Baseline: `find-frontend-foundation - Copy.zip` (Next.js 16.4.3 App Router, React 19, Tailwind 4, shadcn/base-ui, Supabase via `@supabase/ssr`, pnpm).
Basis: code inspection plus executed checks (see `FIND_PHASE_PROGRESS_REPORT.md`). No live Supabase project was contacted, so anything that depends on the live schema/RLS is marked **unverified**.

Database objects referenced by code: `opportunities`, `applications`, `application_checklist_items`, `application_tasks`, `application_links`, `application_activity`, `saved_opportunities`, RPC `has_role`. **The ZIP contains no schema migrations**, so none of their definitions or RLS policies are verifiable from the repo.

Status key: **IV** implemented & verified (code + tests) · **NI** implemented, needs improvement (= Partially implemented) · **PI** partial · **UI** UI-only/not connected · **M** missing · **B** blocked · **NV** needs verification (live DB/RLS, not testable from repo)

| # | Feature | Status | Where | What works | Gaps / risks | Phase |
|---|---|---|---|---|---|---|
| A | Public site: home, about, how-it-works, get-started | NI | `app/page.tsx`, `app/about`, `app/how-it-works`, `app/get-started`, `components/home/*` | Renders, builds, responsive layout system | `Academy / Community / Mentors / Success Stories / Resources / Contact / FAQ` pages do not exist; no newsletter; `AccountPlaceholder`/`PreviewNotice` components still shown | 1 |
| B1 | Opportunity list + filters | NI | `app/opportunities/page.tsx`, `components/opportunities/opportunity-browser.tsx`, `lib/data/opportunities.ts` | Published-only read, client-side filter/sort | Loads **all** published rows (`select *`, no pagination); filtering is client-side; only 5 of 18 types supported; unknown types silently shown as "fellowship"; `unspecified` delivery shown as "on-site"; no nationality/age/language/level filters | 1 |
| B2 | Opportunity detail | NI | `app/opportunities/[id]/page.tsx` | Detail, official-source link, `http(s)` guard at render | Verification status / last-verified date not shown; no share/compare/report-error; no similar opportunities | 1–2 |
| B3 | Save (bookmark) | IV (code) | `components/opportunities/save-opportunity-button.tsx`, `app/saved/page.tsx` | Writes only `saved_opportunities`; never touches `applications` | RLS unverified; legacy `applications.status=saved` rows still exist | 1 |
| B4 | Verification & publication gate | **M** | `app/admin/opportunities/actions.ts`, `app/admin/verification/page.tsx` | Admin-only writes via `has_role` | Any admin can publish unverified; `verified` is not an allowed value in code; no reviewer/timestamp/source/notes; verification page is a "coming next" placeholder | 2 (blocking) |
| C | Registration / sign-in | NI | `components/auth/auth-form.tsx`, `app/auth/callback/route.ts`, `lib/auth/redirect.ts` | Email auth, safe `returnTo` (open-redirect protected, tested) | No password reset / profile creation observed; `/applications` redirects without `redirectTo` | 1 |
| C2 | User profile / CV import / completion score | **M** | — | — | No profile route, table reference or storage use in code | 3 |
| D | User dashboard | **M** | — | — | No dashboard route | 3 |
| E | Find AI (matching, eligibility, readiness, gap, roadmap, navigator, assistant) | **M** here | — | — | No AI code, SDK or server routes in this ZIP. The hackathon MVP appears to be a separate build — see roadmap | 4 |
| F | Application Agent / Document Vault / Form fill | **M** | — | — | No storage, document or automation code | 5 |
| G | Document intelligence | **M** | — | — | — | 5 |
| H | Preparation Center | **M** | — | — | — | 4–5 |
| I | Academy | **M** | — | — | — | 6 |
| J | Application management | NI | `app/applications/*`, `components/applications/*`, `lib/data/applications.ts`, `lib/applications/*` | Start tracking (idempotent), status update, checklist, tasks, links, notes, deadline, activity timeline; owner-scoped queries; progress helpers tested | Status list lacks Planning/Ready for Review/Under Review/Withdrawn; `saved` still a writable status; `applicationId` not UUID-validated; no transitions rules; no calendar/reminders/analytics; applications on unpublished opportunities may be hidden (documented in lifecycle plan) | 2 |
| K | Community / mentors / alumni / stories | **M** | — | — | — | 7 |
| L | Events & notifications | **M** | — | — | — | 3–7 |
| M | Skill passport / portfolio / goals | **M** | — | — | — | 8 |
| N | Admin dashboard | PI | `app/admin/*` | Layout guard, opportunity create/edit with server-side `requireAdmin` | Stats card only counts published; `Users`, `Team`, `Verification` pages are placeholders; no audit log; no RBAC beyond `admin` | 2 |
| O | Organization / university portals | **M** | — | — | Deferred by design | 9 |
| P | Find Agency | **M** | — | — | Deferred by design | 10 |
| Q | Data pipeline / impact analytics | **M** | — | — | — | 8 |

Hygiene findings: see `FIND_ARCHITECTURE_AND_GAPS.md` §4.

## Additional features from the second product prompt (all **M** — no code found)
| Feature | Status | Phase |
|---|---|---|
| Opportunity comparison (2–4 items) | M | 3 |
| Deadline intelligence (overlaps, start-by dates, change alerts) | M | 3 |
| Watchlist and alert criteria | M | 3 |
| Notification center and preferences | M | 3 |
| Skill Passport, Portfolio Builder, Goal Tracker | M | 8 |
| Collaboration / Team Finder | M | 7 |
| Email-to-application integration (confirmations, interview invites) | M | 5 |
| User-controlled AI memory (inspect/edit/delete) | M | 8 |
| Account data export and deletion | M | 3 |
| Audit logs, profile visibility, data-sharing consent | M | 2–3 |

## Decision: application status model (confirmed)
Target: `preparing, ready_to_apply, submitted, under_review, interview, accepted, rejected, withdrawn`. `saved` is not an application status (bookmarks live in `saved_opportunities`). `in_progress` and `waitlisted` stay accepted as legacy values until a reviewed migration. Current code allows `saved, preparing, in_progress, submitted, interview, accepted, rejected, waitlisted`. Whether a DB CHECK constraint exists is **NV** (preflight needed).

## Update — increment 2 (supersedes statuses above where they differ)
The authoritative, generated list is `docs/FEATURE_STATUS.md` (and `/admin/features`). Summary: **1 implemented, 7 partial, 11 scaffolded** of 19 registry features.

| Previously | Now |
|---|---|
| B1 opportunity list: coerced types/modes, no pagination | Mappers fixed; server-side paginated query exists; browser still client-side (partial) |
| B4 verification gate: missing | Still missing; migration `001` **proposed, not applied** (blocked on preflight) |
| C2 profile, notifications, alerts, documents, AI, academy, community, mentors, stories, institutions: missing | **Scaffolded**: route, model, service interface, proposed migration, acceptance criteria; no working functionality |
| Opportunity comparison, deadline intelligence, basic dashboard: missing | **Implemented (partial)** on existing data, with tests |
| D dashboard: missing | Basic dashboard implemented; recommendations, learning, goals, documents widgets pending |

## Update — increment 4
Frontend presence for all modules is tracked in `docs/FRONTEND_ROUTES_AND_MODULES.md` (290 pages; statuses: existing functional, frontend complete — backend pending, frontend partial, requires external integration, coming soon). The backend-status registry in this file's earlier sections is unchanged: pages marked *Frontend complete — backend pending* are **not** functional features.
