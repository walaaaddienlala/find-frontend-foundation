# Find — Implementation Roadmap

> **Numbering (aligned to the second prompt):** Phase 0 = Audit and Foundation Hardening (audit done; hardening in progress: URL validation and log removal done; mapper fixes, env-missing crash, `/admin-check` removal, status-model alignment open). Phase 1 = Platform Foundation incl. verification and source tracking. Phase 2 = Application Management. The verification gate below therefore belongs to **Phase 1**, and the sections titled "Phase 1" and "Phase 2" are renumbered 0 and 1+2 respectively when the next report is issued.

Mapped to the master phases. A phase is "done" only when its acceptance criteria pass with evidence.

## Phase 1 — Foundation (≈85%): finish & harden
- Replace coercing mappers with explicit types; add `unspecified` work mode and the missing opportunity types (needs UI + type changes, no migration).
- Server-side pagination/search; select only needed columns.
- Graceful missing-env behaviour; remove `/admin-check`; password reset; consistent `redirectTo`.
- **Acceptance:** build passes without fonts/env crashes; list handles 1,000 rows with pagination; no unknown type rendered as another type.

## Phase 2 — Applications + Verification gate (next, blocking)
1. Run `phase2-verification-preflight.sql`; review output together.
2. Draft **additive** migration: verification metadata columns, `opportunity_verifications` history, publish-gate trigger/constraint, audit log; RLS so only `has_role(admin|reviewer)` can verify. Existing published-but-unverified rows are **listed for human review**, not changed.
3. App: reviewer UI at `/admin/verification`, server-side gate, show verification + last-verified on public pages, expired/changed flagging.
4. Application status model alignment; lifecycle fixes already planned in `docs/phase1/`.
- **Acceptance:** non-admin cannot verify/publish (DB + server); publish of unverified is rejected; every verification records reviewer/time/source/notes; integration tests with disposable accounts on a staging project.

## Phase 3 — Personalization
`profiles` table + RLS, profile page, completion score, dashboard "What should I do today?", explainable rule-based recommendations first (no AI dependency).

## Phase 4 — Find AI
**First locate the EUI-hackathon Find AI MVP** and decide whether to port it. Server-side AI service layer (keys server-only, rate limits, cost caps, grounding on stored verified opportunities, uncertainty labels, no fabricated user facts): eligibility → readiness → gap → roadmap.

## Phases 5–10
5 Document vault (private storage, short-lived signed URLs) → requirements analyzer → assisted/auto-fill (never submit without explicit approval of the exact final version; stop at CAPTCHA/MFA). 6 Academy. 7 Community/mentors/stories (moderation first; no fabricated stories). 8 Navigator, assistant, analytics, user-approved memory. 9–10 Org/university portals, Agency.

## Order of work and dependencies
Schema in repo → verification gate → integration/E2E test harness → profile → dashboard → AI → documents → rest. Phases 3+ depend on a trustworthy opportunity dataset (Phase 2).
