# Find — Feature Status (generated)

> Generated from `lib/features/registry.ts` by `pnpm docs:features`. Do not edit by hand; a test fails if this file is out of date.

Totals: implemented 1 · partial 11 · scaffolded 10 · pending 0 · blocked 0 · needs_config 0

| Feature | Area | Phase | Status | Route | Proposed migration |
|---|---|---|---|---|---|
| Core hardening | core | 0 | partial | — | `001_verification_gate.sql` |
| Opportunity comparison | intelligence | 3 | partial | `/compare` | — |
| Deadline tracking | intelligence | 3 | partial | `/deadlines` | — |
| Basic dashboard | intelligence | 3 | partial | `/dashboard` | — |
| User profile and preferences | personalization | 3 | scaffolded | `/profile` | `002_profiles.sql` |
| Notification preferences | notifications | 3 | scaffolded | `/settings/notifications` | `003_notifications.sql` |
| Notification center and delivery | notifications | 3 | partial | `/notifications` | `003_notifications.sql` |
| Alert rules and watchlists | notifications | 3 | scaffolded | `/alerts` | `003_notifications.sql` |
| Document vault | documents | 5 | partial | `/documents` | `004_documents.sql` |
| Find AI hub and agents | ai | 4 | partial | `/ai` | `005_ai.sql` |
| Find Academy | academy | 6 | scaffolded | `/academy` | `006_academy.sql` |
| Course detail | academy | 6 | scaffolded | `/academy/courses/[slug]` | — |
| Community spaces | community | 7 | scaffolded | `/community` | `007_community_mentors.sql` |
| Mentors and sessions | community | 7 | scaffolded | `/mentors` | `007_community_mentors.sql` |
| Success stories | community | 7 | scaffolded | `/success-stories` | `007_community_mentors.sql` |
| Institution profiles and portal | institutions | 9 | scaffolded | `/institutions` | `008_institutions.sql` |
| Institution management (admin) | institutions | 9 | scaffolded | `/admin/institutions` | — |
| Application status transitions | applications | 1 | partial | — | — |
| Find AI Agent v1 (grounded retrieval) | ai | 3 | partial | — | — |
| Website chatbot | chatbot | 4 | partial | — | — |
| WhatsApp channel | chatbot | 4 | partial | — | — |
| Feature status board | admin | 0 | implemented | `/admin/features` | — |

## Parts

### Core hardening (partial)

- **implemented** — Opportunity type/delivery mappers (no silent coercion)
- **implemented** — Environment helper; header, mobile nav, data layer, admin, saved and applications degrade without Supabase env
- **implemented** — Debug route /admin-check, stale lib/types.js and header debug logging removed
- **implemented** — Server-side paginated + filtered query (getOpportunitiesPage)
- **implemented** — Explicit column list instead of select(*)
- **pending** — Opportunity browser switched to server-side filtering _(Browser still filters client-side (9 per page).)_
- **blocked** — Verification & publication gate _(Needs phase2-verification-preflight.sql output.)_
- **blocked** — Application status alignment _(Needs applications.status constraint from preflight.)_

### Opportunity comparison (partial)

- **implemented** — ID parsing, validation and 4-item cap
- **implemented** — Comparison table with differing rows highlighted
- **implemented** — Searchable picker (server-side)
- **pending** — Compare buttons on cards and detail page
- **pending** — Saved comparisons for signed-in users _(Needs a table; not proposed yet.)_

### Deadline tracking (partial)

- **implemented** — Upcoming opportunity deadlines (60 days)
- **implemented** — Closing-soon classification
- **implemented** — Overlap clusters (deadlines within 3 days)
- **implemented** — My application deadlines (signed in)
- **pending** — Preparation-time estimate and recommended start date _(Needs profile + checklist data.)_
- **pending** — Deadline-change alerts _(Needs notifications + change history.)_

### Basic dashboard (partial)

- **implemented** — Saved and application counts
- **implemented** — Upcoming application deadlines
- **implemented** — Rule-based next actions (explainable, not AI)
- **pending** — Recommended opportunities _(Needs profile + matching.)_
- **pending** — Learning progress and goals _(Needs academy + goals tables.)_
- **pending** — Missing documents _(Needs document vault.)_

### User profile and preferences (scaffolded)

- **scaffolded** — Data model types
- **scaffolded** — Service interface with auth guard
- **scaffolded** — Route (gated, explains status)
- **scaffolded** — Proposed migration (profiles, profile_entries)
- **pending** — Profile form and persistence
- **pending** — Completion score _(Define required fields with product first.)_
- **pending** — CV import / LinkedIn import
- **pending** — Public/private controls and export

### Notification preferences (scaffolded)

- **scaffolded** — Model and service interface
- **scaffolded** — Route
- **scaffolded** — Proposed migration (notification_preferences)
- **pending** — Preferences UI and persistence

### Notification center and delivery (partial)

- **implemented** — Delivery channel interface and dedupe-key helper _(Pure helper only; no delivery happens.)_
- **scaffolded** — Model and service interface
- **scaffolded** — Route
- **scaffolded** — Proposed migration (notifications)
- **pending** — Inbox UI, mark-as-read
- **blocked** — Email delivery provider _(Needs provider decision and credentials.)_
- **blocked** — Push / WhatsApp _(Needs provider, consent flow and compliance review.)_

### Alert rules and watchlists (scaffolded)

- **scaffolded** — Rule criteria model and service interface
- **scaffolded** — Route
- **scaffolded** — Proposed migration (alert_rules)
- **pending** — Rule builder UI
- **pending** — Rule evaluation job

### Document vault (partial)

- **implemented** — Upload policy (types, size, categories, path builder) _(Pure validation only; nothing is stored.)_
- **scaffolded** — Model and service interface
- **scaffolded** — Route
- **scaffolded** — Proposed migration + private bucket policies
- **pending** — Upload/preview/download UI
- **blocked** — Malware scanning _(Needs scanning service decision.)_
- **pending** — AI extraction and classification _(Depends on find-ai.)_

### Find AI hub and agents (partial)

- **implemented** — Agent registry with permitted data and approval rules _(Declarative; no model calls.)_
- **implemented** — Guardrail constants (no fabrication, approval before submit)
- **scaffolded** — Provider interface and audit event types
- **scaffolded** — Service interface and route
- **scaffolded** — Proposed migration (ai_audit_log, ai_memory, ai_usage_daily)
- **blocked** — Provider implementation (server-side) _(Needs provider choice, key management, cost limits.)_
- **pending** — Matching / eligibility / readiness / gap / roadmap agents
- **blocked** — Application Agent _(Needs document vault, approval UI and legal review.)_
- **pending** — Locate and merge the hackathon Find AI MVP

### Find Academy (scaffolded)

- **scaffolded** — Models and service interface
- **scaffolded** — Catalog route
- **scaffolded** — Proposed migration (courses, modules, lessons, enrollments, progress, certificates)
- **pending** — Catalog, enrollment and progress UI
- **pending** — Assessments and assignments _(Not yet proposed in schema.)_
- **pending** — Course authoring (admin)

### Course detail (scaffolded)

- **scaffolded** — Route (slug validated, no data lookup yet)
- **pending** — Course content rendering

### Community spaces (scaffolded)

- **scaffolded** — Models and service interface
- **scaffolded** — Route
- **scaffolded** — Proposed migration (communities, members, posts, comments, reports)
- **pending** — Spaces, posting and moderation UI
- **pending** — Moderation queue (admin)

### Mentors and sessions (scaffolded)

- **scaffolded** — Models and service interface
- **scaffolded** — Route
- **scaffolded** — Proposed migration (mentor_profiles, mentor_sessions)
- **pending** — Discovery, booking and calendar UI
- **pending** — Mentor verification workflow

### Success stories (scaffolded)

- **scaffolded** — Model and service interface
- **scaffolded** — Route
- **scaffolded** — Proposed migration (success_stories)
- **pending** — Submission, review and listing UI

### Institution profiles and portal (scaffolded)

- **scaffolded** — Models and service interface
- **scaffolded** — Route
- **scaffolded** — Proposed migration (institutions, institution_members)
- **pending** — Institution onboarding and verification
- **blocked** — Opportunity publishing by institutions _(Must go through the verification gate first.)_
- **pending** — Analytics for institutions

### Institution management (admin) (scaffolded)

- **scaffolded** — Route (admin only)
- **pending** — Review/verify/suspend actions

### Application status transitions (partial)

- **implemented** — Transition rules (pure) with unit tests
- **implemented** — Server-side enforcement with optimistic concurrency (updateApplicationAction)
- **implemented** — Status select offers only the current and valid next statuses _(Not exercised in a browser.)_
- **implemented** — Nothing can be moved into legacy 'saved'
- **blocked** — ready_to_apply / under_review / withdrawn statuses _(Needs migration 009 and the applications constraint from preflight.)_
- **blocked** — Migrating legacy 'saved' application rows _(Needs preflight data counts and an approved data-migration plan.)_
- **pending** — Integration test against a real database

### Find AI Agent v1 (grounded retrieval) (partial)

- **implemented** — Rule-based intent and entity detection
- **implemented** — Permission-aware, read-only tool registry (no write/submit tools exist)
- **implemented** — Orchestrator: search, explain, compare, deadlines, my applications, human-support honesty
- **implemented** — Eligibility view: lists requirements, marks each 'not checked', never concludes _(Real checking needs verified profile data (profile feature).)_
- **implemented** — Request validation, same-origin check, in-memory rate limit _(Rate limit is per server instance; a shared store is pending.)_
- **implemented** — Deterministic behaviour tests (permissions, grounding, no-invention)
- **needs_config** — LLM provider for phrasing/classification _(Provider choice, server-side key and cost limits.)_
- **pending** — Retrieval over documents (RAG) and Document Intelligence
- **blocked** — Server-side conversation history, user memory, audit log, token/cost monitoring _(Needs migration 005 (and a conversations table: not yet proposed).)_
- **pending** — Shared rate-limit store
- **blocked** — Matching, readiness, gap, roadmap, CV, essay, interview agents _(Need profile, documents and academy data.)_
- **pending** — LLM evaluation suite and prompt versioning _(No prompts exist yet.)_

### Website chatbot (partial)

- **implemented** — Chat API (POST /api/chat): validation, same-origin, rate limit, auth-aware _(Verified by runtime probes against a built server.)_
- **implemented** — Widget: button, dialog, typing indicator, starters, cards, links, retry, new conversation _(Typechecked and built; not exercised in a browser.)_
- **implemented** — Transcript kept in this browser tab only (sessionStorage)
- **blocked** — Server-side conversation history _(Needs a conversations migration (not yet proposed).)_
- **blocked** — Feedback buttons _(Needs storage for feedback.)_
- **pending** — File upload in chat _(Depends on the document vault.)_
- **pending** — Human support handoff _(No support channel exists; the bot says so and sends nothing.)_
- **blocked** — Admin: conversation management, knowledge sources, analytics _(Needs storage and the admin roles model.)_

### WhatsApp channel (partial)

- **implemented** — Webhook handshake, HMAC signature verification, payload normalisation, reply formatting _(Unit-tested.)_
- **implemented** — Webhook handler: inert without config, dedupe, per-sender rate limit, never fails the webhook _(Unit-tested with injected fakes.)_
- **needs_config** — Graph API sender (provider abstraction) _(Never called against the real API.)_
- **needs_config** — Live end-to-end verification (webhook registration, send, receive)
- **blocked** — Secure account linking and consent records _(Needs a migration; until then WhatsApp is guest-only.)_
- **blocked** — Application status and reminders over WhatsApp _(Needs account linking and notification delivery.)_
- **pending** — Human support handoff, media messages, Telegram and other channels

### Feature status board (implemented)

- **implemented** — Registry-driven status board
