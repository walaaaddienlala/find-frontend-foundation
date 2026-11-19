# Find — Security and Privacy Review

Scope: static review of the ZIP plus executed local checks. Live Supabase RLS/grants were **not** inspected (no schema in repo; no live access used).

## Verified strengths
- No service-role key or secret in source; only public URL + publishable key.
- Admin writes re-check auth **and** `has_role(admin)` inside every server action (not only in the layout).
- User application actions filter by `user_id` and verify ownership before child-record writes.
- Open-redirect protection on auth `next` (`getSafeReturnTo`, unit-tested).
- Security headers set (nosniff, referrer policy, HSTS, permissions policy). No `dangerouslySetInnerHTML`.
- Application link URLs normalized to http(s) only.

## Findings

| ID | Sev | Finding | Status |
|---|---|---|---|
| S1 | High | Unverified opportunities can be published; no reviewer accountability or audit trail | Open — Phase 2 |
| S2 | High | RLS, grants, constraints and `has_role` definition not in repo / not verifiable | Open — run preflight SQL |
| S3 | Med | Admin opportunity URLs validated with bare `new URL()` (accepts `javascript:`/`data:`); only render-time guard existed | **Fixed** (`lib/validation/url.ts`, tested) |
| S4 | Med | Header logged user ID, session user and auth events to the browser console in production | **Fixed** |
| S5 | Med | `.env.local` shipped in the archive | Open — remove from archives; rotate publishable key if shared |
| S6 | Low | `/admin-check` debug page exposed email/user ID and role-RPC errors | **Fixed** (route removed, increment 2) |
| S7 | Low | `select *` pulled every column (incl. internal ones) on public reads | **Fixed for opportunities** (explicit, compile-checked column list). Column-level `anon` grants still need review via preflight |
| S8 | Low | `applicationId` in `updateApplicationAction` not UUID-validated (RLS/`user_id` filter still protect) | Open |
| S9 | Low | Server actions throw raw DB error messages to the client (`Could not create opportunity: ${error.message}`) | Open |
| S10 | Info | No rate limiting, abuse protection or audit logging anywhere yet | Open — required before AI/document features |

## Privacy requirements for upcoming phases
Private storage buckets with owner-only policies and short-lived signed URLs; never log document contents; AI keys server-only; per-user data isolation in every AI prompt; explicit consent and retention rules for AI memory; user-approved profile fields only; no fabricated user achievements.

## Update — increment 2 (scaffold foundation)
- Added: search-term sanitizer (PostgREST filter injection), upload policy (type/size/filename/path), AI guardrails (no agent can submit; approval must match exact version), audit redaction, dedupe keys. All unit-tested.
- Proposed (not applied) migrations enable RLS on every new table, keep private tables off `anon`, route privileged writes through `security definer` functions with `set search_path = public`, and use a private storage bucket with owner-folder policies. **Unexecuted; RLS must be tested on staging with two disposable users before any approval.**
- New open item **S11 (Med):** `has_role('admin')` is used inside policies that also apply to `anon` (006–008). Verify it returns false rather than raising (preflight query 6).
- New open item **S12 (Low):** scaffold visibility is a build-time `NEXT_PUBLIC_*` flag; do not rely on it for access control (routes still enforce auth server-side).

## Update — increment 3 (agent, chatbot, WhatsApp)
- **Agent:** read-only tools only; guests cannot reach private tools; every link is `http(s)`-validated; no message content is logged or stored; eligibility is never asserted without verified data.
- **Chat API:** same-origin check, body size/length limits, rate limiting, endpoint disabled (404) when the feature flag is off.
- **WhatsApp:** HMAC-SHA256 verification of the raw body with constant-time comparison; inert (503) until fully configured; secrets are server-only env vars; guest-only until account linking exists. **Not tested against Meta.**
- **S13 (Med):** rate limits and WhatsApp dedupe are in-memory per instance (best-effort on serverless). Use a shared store before launch.
- **S14 (Low):** `x-forwarded-for` is only trustworthy behind a proxy that overwrites it.
- **S15 (Info):** the chat widget and status select have not been tested in a browser (no XSS found in review: replies are rendered as text, never as HTML).
- **Open:** no audit log or conversation storage yet (migration 005 plus a conversations table), so abuse investigation is not possible.

## Update — increment 4 (frontend ecosystem)
- No new data access, storage, endpoints or secrets. Ecosystem pages render static sample data; forms run client-side validation only and never transmit input.
- Role "experiences" (student, mentor, instructor, moderator, organization, university) are **demo views and grant no access**; the pages say so. Only `/admin/*` is protected, by the existing server-side admin check (demo admin pages sit behind it).
- Sample pages are `noindex`. Sample people and organizations are invented and labelled; no real credentials are claimed.
- Live blocks reuse the existing sanitised, paginated queries (advanced search sanitises text; funding filter is server-side).
- Fixed: `/admin` and `/admin/opportunities` created a server client without a configuration guard.
- **S16 (Low):** the sample collections are static; when replaced by APIs, apply the same authorization/RLS and consent rules as the production features (organizations and universities must never see another tenant's data; talent discovery needs explicit consent).
