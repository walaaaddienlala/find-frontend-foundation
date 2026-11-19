# Full-Ecosystem Audit and Phase Plan

Basis: the working tree built from your original ZIP plus my earlier increments, and the Master Product Document from your first message. The `files (4).zip` named in the latest prompt did not arrive, so it was **not** read. Statuses come from `lib/features/registry.ts` (23 features: 1 implemented, 11 partial, 11 scaffolded). "Implemented" means real data, authorization and tests; nothing is "Released" (no production deployment verified).

## A. Existing implementation, by ecosystem module
| Module | State |
|---|---|
| 1 Find Platform | Public site, opportunity list/detail/search (client-side filtering), auth, saved, applications, `/compare`, `/deadlines`, `/dashboard` work. No profile, no onboarding, no settings/privacy/export. |
| 2 Find AI | Agent v1 (grounded retrieval, read-only) works. No LLM, memory, audit, matching/readiness/gap/roadmap/CV/essay/interview agents. |
| 3 Find Chatbot | Website widget + API work behind a flag (browser-untested). WhatsApp architecture only (not live). No server history, feedback, upload, handoff. |
| 4 Academy | Scaffold + proposed migration. |
| 5 Community | Scaffold + proposed migration; no moderation. |
| 6 Mentors | Scaffold + proposed migration. |
| 7 Network | Not started beyond success-stories scaffold. |
| 8 Agency | Not started. |
| 9 Organizations/Institutions | Scaffold + proposed migration. |
| 10 Preparation Center | Not started (document vault scaffold only). |
| 11 Application Management | Tracker, checklist, tasks, links, activity work; **status transitions now enforced**. Legacy `saved` status and 3 product statuses blocked on migration 009. |
| 12 Opportunity Intelligence | Compare/deadlines work. **Verification gate not built** (blocked on preflight). No duplicate/expiry detection, reviews, analytics, organization publishing. |
| 13 Admin/Internal | Opportunity admin works; feature board added. Users/team/verification/chatbot/AI/audit admin missing; single `admin` role. |

## B. Target checklist
The master prompt's sections 4–18 map to the modules above. Everything not listed as working in A is **not implemented**, including: onboarding, profile editor and passports, CV builder/analyzer, interview simulator, document vault, recommendations, notification delivery and scheduled jobs, reviews, impact dashboard, Arabic/RTL, payments (deliberately off).

## C. Dependency and blocker map
```
Preflight output ─▶ 001 verification gate ─▶ trusted data ─▶ matching / eligibility with real data
              └──▶ 009 status alignment ─▶ product statuses, legacy-saved migration
002 profiles ─▶ eligibility/readiness/gap/roadmap ─▶ recommendations, dashboard widgets
004 documents + scanning ─▶ CV/document intelligence ─▶ Application Agent (+ approval UI + legal review)
005 AI tables + conversations table ─▶ persistent chat history, memory, audit, cost monitoring
003 notifications + provider decision ─▶ reminders, alerts, WhatsApp notifications
008 institutions ─▶ organization/university portals (needs 001)
LLM provider + keys ─▶ any generative feature
```
External decisions needed: AI provider and key management; email/push/WhatsApp providers and consent flow; malware scanning; moderation and mentor-verification policies; support channel; payment provider and legal review; migration approver.

## D. Database migration plan
Proposed, **not applied**: 001–009 in `supabase/migrations-drafts/proposed/`; read-only preflights beside them. Order and approval gates: `000_README.md`. **Still to be proposed** (not drafted): conversations/messages for the chatbot, channel account-linking and consent, feedback, reviews, analytics events, organization roles and application intake, Agency service requests. Rollback sections exist per file; none has been tested.

## E. Phased plan and stopping point
| Phase | Status |
|---|---|
| 0 Audit and foundation | Done (audit, hardening, registry, tests) |
| 1 Core platform | **Partial.** Done: mappers/env/pagination query, comparison, deadlines, dashboard, **application transitions**. Blocked: verification gate, status alignment. Pending: profile, onboarding. |
| 3 Agent v1 | **Done in grounded mode**; LLM, memory, audit blocked/needs config |
| 4 Chatbot | **Website done (flagged); WhatsApp architecture only** |
| 2, 5–10 | Not started beyond scaffolds. |
**Stopping point:** next unblocked work, in order: (1) run preflights → build 001 reviewer workflow; (2) profile after 002 approval; (3) conversations migration → persistent chat history; (4) pick LLM provider → phrasing layer; (5) notification delivery after provider choice. Phase order differs from the prompt (Agent/Chatbot before Preparation) because they needed no database change.

## Update — increment 4
Module table in section A is superseded for **frontend** coverage: every module (Academy, Community, Mentors, Network, Agency, Organization and University portals, Preparation Center, Events, Resources, Team Finder, Find AI tools, chatbot pages, roles, admin) now has complete frontend pages with sample data. **Backend, integrations and business logic for all of them remain as described in sections C and D**; per-module backend work is in `docs/FRONTEND_BACKEND_REQUIREMENTS.md`.
