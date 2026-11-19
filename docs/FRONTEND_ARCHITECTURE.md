# Find — Frontend Ecosystem Architecture

The whole ecosystem is declared as data and rendered by a small set of templates, so every module looks like one product and navigation can never point at a missing page.

## How it fits together
```
lib/ecosystem/
  types.ts        Page, Block, Field, status types (5 statuses, see below)
  dsl.ts          helpers: hub(), coll(), detail(), form(), tool(), work(), dash(), existing()
  demo.ts         SAMPLE datasets (one uniform DemoItem shape per collection)
  pages-*.ts      page definitions per module group
  registry.ts     merges pages; module titles, sub-nav roots, backend requirements
  resolve.ts      URL -> page (dynamic [slug] pages only resolve for real items)
  navigation.ts   the six sections (header menu, mobile menu, footer, /explore, tests)
  coverage.ts     every item in the product spec -> the route that provides it
components/ecosystem/
  page-shell.tsx  breadcrumbs, module sub-nav, status banner, backend panel
  blocks.tsx      renders each block kind (cards, stats, tables, steps, kanban, collection, item…)
  demo-form.tsx   validating form that NEVER claims to save    tool-block.tsx  fixed-sample AI preview
  quiz-block.tsx  browser-only sample quiz                      full-chat.tsx   real chat UI (uses /api/chat)
  live.tsx        blocks backed by REAL published data (categories, advanced search, deadline calendar)
app/[...path]/page.tsx        renders registry pages (static where possible)
app/admin/[...path]/page.tsx  same, inside the real admin guard
```
Explicit routes (`/opportunities`, `/applications`, `/compare`, auth, API…) always win over the catch-alls.

## Statuses (shown on every page)
| Status | Meaning |
|---|---|
| Existing functional | Works today with real data (explicit route) |
| Frontend complete — backend pending | Full UI with clearly labelled sample data; nothing saved or sent |
| Frontend partial | Part uses real data (e.g. category pages, advanced search, deadline calendar), the rest is demo |
| Requires external integration | UI exists; cannot work until a provider/account is connected |
| Coming soon | Planned, not available |

## Honesty rules (enforced by `tests/ecosystem.test.cjs`)
- Sample records carry a visible **Sample** badge and the page shows a status banner.
- Forms validate input but their result text says nothing was saved or sent; submit labels or notes disclose it (`(not available)`, "Not connected").
- AI tool pages say up front that the result is a fixed, hand-written sample, not AI, and not based on input.
- No page may contain a success claim ("saved successfully", "request sent"…).
- Categories the opportunity catalog cannot represent show an honest empty state; nothing is invented.
- Role pages are demo views and grant no access. Only `/admin/*` is protected (real admin check).

## Adding or graduating a page
1. Add a definition in the relevant `pages-*.ts` (use a helper). 2. Add it to `coverage.ts` if it implements a spec item and to `navigation.ts` if it needs a menu entry. 3. `pnpm docs:frontend`, `pnpm test:ecosystem`. 4. To make a page real, build an **explicit** route (it then wins over the catch-all), set the registry entry to `existing` with no blocks, and replace its sample collection with an API-backed source.

## Commands
`pnpm typecheck` · `pnpm test:phase1-all` (includes ecosystem tests) · `pnpm docs:frontend` · `pnpm build` then `node scripts/crawl-routes.cjs http://127.0.0.1:3000` (requests every route and follows every link; fails on any 404/5xx).

## Design conventions
Reuse `Container`, `PageHeader`, `Section`, `Button`, `Badge`, `EmptyState`/`ErrorState`/`LoadingState`. Layouts are responsive Tailwind (grids collapse to one column; wide tables and the calendar scroll horizontally). Controls have labels; errors use `role="alert"`; the Explore menu closes on Escape/outside click/navigation. Ecosystem pages are `noindex` while they hold sample content. Arabic/RTL is not implemented (planned).

## Known limits
Visual design, responsive behaviour and client interactions were **not checked in a real browser or on devices** (only builds, markup checks and an HTTP crawl). Public pages have no `loading.tsx`; auth-gated routes must not get one (it breaks the 307 redirect).
