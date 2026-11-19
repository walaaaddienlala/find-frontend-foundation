# Find — Backend Requirements for the Frontend Ecosystem (generated)

> Generated from `lib/ecosystem/registry.ts` by `pnpm docs:frontend`. The frontend is built; this lists what the development team must implement behind each module.

## Per module

### Find Platform

Pages: 12 (Frontend complete — backend pending 6, Frontend partial 5, Requires external integration 1)

- Profiles and onboarding persistence
- User settings, privacy and consent storage
- Notification preferences and notification center
- Data export and account deletion workflows
- Personalized feed ranking (needs profile + matching)

Pages that cannot work without an external integration: `/settings/data`

### Opportunities

Pages: 3 (Frontend partial 3)

- Server-side filtering and pagination in the opportunity browser
- Opportunity types beyond the current 9 (research, exchange, summer school, grants, jobs, entrepreneurship, incubators, accelerators, leadership)
- Verification and publication gate (migration 001)
- Source tracking, duplicate and expiry detection

### Profile and Passports

Pages: 11 (Frontend complete — backend pending 9, Requires external integration 2)

- profiles and profile_entries tables (migration 002) with owner-only RLS
- Allow-listed public profile view
- Private document storage, versions and scanning (migration 004)
- Skill and opportunity passport aggregation with evidence and verification

Pages that cannot work without an external integration: `/profile/documents`, `/documents`

### Find AI

Pages: 25 (Frontend complete — backend pending 24, Requires external integration 1)

- LLM provider, server-side keys, cost caps and per-user quotas
- Conversation storage, user-approved memory and audit log (migration 005 + conversations table)
- Retrieval over verified opportunities and user documents
- Per-tool services (matching, eligibility, readiness, gap, roadmap, CV, essay, interview) with grounding and no fabrication
- Evaluation suite and prompt versioning

Pages that cannot work without an external integration: `/ai/history`

### Find Chatbot

Pages: 7 (Frontend complete — backend pending 3, Requires external integration 4)

- Conversation and feedback storage
- Support handoff queue and human support console
- WhatsApp: Meta app, credentials, webhook registration, account linking and consent
- Telegram channel adapter

Pages that cannot work without an external integration: `/chat/history`, `/chat/support`, `/chat/feedback`, `/chat/channels`

### Preparation Center

Pages: 33 (Frontend complete — backend pending 33)

- Draft and checklist persistence
- CV builder export (PDF/DOCX)
- Mock-interview scheduling, recording and feedback
- AI feedback services (see Find AI)

### Find Academy

Pages: 25 (Frontend complete — backend pending 22, Requires external integration 3)

- Courses, modules, lessons, enrollments, progress, certificates (migration 006)
- Video hosting
- Assignments, quizzes and assessments tables
- Instructor authoring tools and cohort management

Pages that cannot work without an external integration: `/academy/lessons/[slug]`, `/academy/lessons`, `/academy/certificates`

### Find Community

Pages: 18 (Frontend complete — backend pending 17, Requires external integration 1)

- Communities, membership, posts, comments, reports (migration 007)
- Moderation queue, roles and abuse prevention before public posting
- Events integration

Pages that cannot work without an external integration: `/community/report`

### Find Mentors

Pages: 11 (Frontend complete — backend pending 7, Requires external integration 4)

- Mentor profiles, verification, sessions (migration 007)
- Availability, calendar integration and booking
- Reviews and feedback storage
- Matching service

Pages that cannot work without an external integration: `/mentors/requests`, `/mentors/book`, `/mentors/reviews`, `/mentors/apply`

### Someone Who Did It

Pages: 11 (Frontend complete — backend pending 10, Requires external integration 1)

- Success story submission, consent, evidence and editorial review (migration 007)
- Question routing to contributors

Pages that cannot work without an external integration: `/someone-who-did-it/ask`

### Team Finder

Pages: 11 (Frontend complete — backend pending 9, Requires external integration 2)

- Teams, membership and requests tables
- Teammate discovery with skills and availability (consent-based)

Pages that cannot work without an external integration: `/teams/create`, `/teams/requests`

### Find Events

Pages: 13 (Frontend complete — backend pending 10, Requires external integration 3)

- Events, registration, attendance and recordings tables
- Email reminders and calendar sync
- Video hosting for recordings

Pages that cannot work without an external integration: `/events/register`, `/events/attendance`, `/events/recordings`

### Resource Library

Pages: 10 (Frontend complete — backend pending 9, Requires external integration 1)

- Resource storage, versioning and download tracking
- Saved resources per user

Pages that cannot work without an external integration: `/resources/downloads`

### Find Network

Pages: 10 (Frontend complete — backend pending 10)

- Network profiles and roles (alumni, ambassador, contributor, trainer, leader)
- Consent-based public listing

### Find Agency

Pages: 13 (Frontend complete — backend pending 11, Requires external integration 2)

- Service catalogue, requests, booking and client dashboard tables
- Payments only after a compliant provider, legal and security review

Pages that cannot work without an external integration: `/agency/request`, `/agency/book`

### Organization Portal

Pages: 17 (Frontend complete — backend pending 14, Requires external integration 3)

- Institutions and institution_members with tenant isolation (migration 008)
- Organization verification workflow
- Opportunity publishing through the verification gate
- Applicant intake with consent, talent discovery with explicit consent
- Organization analytics (aggregated)

Pages that cannot work without an external integration: `/organizations/register`, `/organizations/verification`, `/organizations/talent`

### University Portal

Pages: 13 (Frontend complete — backend pending 11, Requires external integration 2)

- Institutions with university role, departments and announcements tables
- Student engagement analytics (aggregated, privacy-preserving)
- University verification workflow

Pages that cannot work without an external integration: `/universities/talent`, `/universities/verification`

### Admin Dashboard

Pages: 22 (Frontend complete — backend pending 22)

- Admin role model beyond admin (reviewer, moderator, support)
- Audit log (migration 001)
- Real data behind user, organization, academy, moderation and support screens
- AI and chatbot configuration storage

### Experiences by Role

Pages: 5 (Frontend complete — backend pending 5)

- Role-based access control for mentor, instructor, moderator, organization and university roles

### Grow

Pages: 3 (Frontend complete — backend pending 3)

- Roadmaps, goals and progress persistence
- Cross-module progress aggregation

## Suggested API contract for the sample collections

Sample data lives in `lib/ecosystem/demo.ts` with one uniform shape (`DemoItem`: slug, title, subtitle, summary, tags, meta pairs, sections). Replace each collection with an API-backed source returning the same shape (or extend the shape and the renderer together). These endpoints are **suggestions, not implemented**.

| Collection | Detail path (frontend) | Suggested list | Suggested detail | Sample items |
|---|---|---|---|---|
| courses | `/academy/courses/[slug]` | `GET /api/courses?q=&tag=&page=` | `GET /api/courses/{slug}` | 12 |
| paths | `/academy/paths/[slug]` | `GET /api/paths?q=&tag=&page=` | `GET /api/paths/{slug}` | 5 |
| workshops | `/academy/workshops/[slug]` | `GET /api/workshops?q=&tag=&page=` | `GET /api/workshops/{slug}` | 5 |
| bootcamps | `/academy/bootcamps/[slug]` | `GET /api/bootcamps?q=&tag=&page=` | `GET /api/bootcamps/{slug}` | 3 |
| cohorts | `/academy/cohorts/[slug]` | `GET /api/cohorts?q=&tag=&page=` | `GET /api/cohorts/{slug}` | 4 |
| instructors | `/academy/instructors/[slug]` | `GET /api/instructors?q=&tag=&page=` | `GET /api/instructors/{slug}` | 6 |
| lessons | `/academy/lessons/[slug]` | `GET /api/lessons?q=&tag=&page=` | `GET /api/lessons/{slug}` | 3 |
| communities | `/community/[slug]` | `GET /api/communities?q=&tag=&page=` | `GET /api/communities/{slug}` | 12 |
| members | `/community/members/[slug]` | `GET /api/members?q=&tag=&page=` | `GET /api/members/{slug}` | 8 |
| posts | `/community/posts/[slug]` | `GET /api/posts?q=&tag=&page=` | `GET /api/posts/{slug}` | 8 |
| mentors | `/mentors/[slug]` | `GET /api/mentors?q=&tag=&page=` | `GET /api/mentors/{slug}` | 10 |
| stories | `/success-stories/[slug]` | `GET /api/stories?q=&tag=&page=` | `GET /api/stories/{slug}` | 8 |
| teams | `/teams/[slug]` | `GET /api/teams?q=&tag=&page=` | `GET /api/teams/{slug}` | 6 |
| events | `/events/[slug]` | `GET /api/events?q=&tag=&page=` | `GET /api/events/{slug}` | 10 |
| resources | `/resources/[slug]` | `GET /api/resources?q=&tag=&page=` | `GET /api/resources/{slug}` | 14 |
| network | `/network/[slug]` | `GET /api/network?q=&tag=&page=` | `GET /api/network/{slug}` | 12 |
| services | `/agency/services/[slug]` | `GET /api/services?q=&tag=&page=` | `GET /api/services/{slug}` | 8 |

## Rules for replacing sample data

- Real records must come from authorized services with RLS or equivalent; never expose private fields.
- Remove the `Sample` badge only for records that are real; keep demo pages' status banner until the page is fully backed.
- Keep forms honest: a form may say it saved or sent something only after the server confirmed it.
- Do not run production SQL migrations from the frontend work; use the reviewed proposals in `supabase/migrations-drafts/proposed/`.
