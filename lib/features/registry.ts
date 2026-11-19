/**
 * Find feature registry: the single source of truth for what exists, what is
 * scaffolded and what is still pending. Pure data (no imports) so it can be
 * rendered by /admin/features, drives every scaffold page, and is verified by
 * tests/scaffold-registry.test.cjs (routes, files, migrations and tests must exist).
 *
 * Rule: never mark a part "implemented" unless it works against real data AND
 * has a test listed in `tests`. Mark scaffolds as "scaffolded", unstarted work
 * as "pending", and work waiting on a decision/verification as "blocked".
 */
/** needs_config = code exists but it cannot run until credentials/accounts/providers are set up. */
export type PartStatus = "implemented" | "scaffolded" | "pending" | "blocked" | "needs_config";
export type FeatureStatus = PartStatus | "partial";
export type FeatureAccess = "public" | "user" | "admin";
export type FeatureArea =
  | "core"
  | "intelligence"
  | "personalization"
  | "notifications"
  | "documents"
  | "ai"
  | "academy"
  | "community"
  | "institutions"
  | "applications"
  | "chatbot"
  | "admin";

export type FeaturePart = { label: string; status: PartStatus; note?: string };

export type FeatureInput = {
  id: string;
  area: FeatureArea;
  title: string;
  phase: number;
  route?: string;
  access: FeatureAccess;
  summary: string;
  parts: FeaturePart[];
  dependencies: string[];
  acceptance: string[];
  todos: string[];
  /** Key source files owned by this feature (checked to exist by tests). */
  files: string[];
  /** Tests covering the implemented parts (checked to exist by tests). */
  tests?: string[];
  /** Proposed migration in supabase/migrations-drafts/proposed/ (NOT applied). */
  migration?: string;
  models?: string[];
  serviceMethods?: string[];
};

export type FeatureSpec = FeatureInput & { status: FeatureStatus };

export function deriveStatus(parts: FeaturePart[]): FeatureStatus {
  const has = (s: PartStatus) => parts.some((p) => p.status === s);

  if (parts.every((p) => p.status === "implemented")) return "implemented";
  if (has("implemented")) return "partial";
  if (has("scaffolded")) return "scaffolded";
  if (parts.every((p) => p.status === "blocked")) return "blocked";
  if (parts.every((p) => p.status === "needs_config")) return "needs_config";
  return "pending";
}

const input: FeatureInput[] = [
  // ───────────────────────── 1. Core hardening ─────────────────────────
  {
    id: "core-hardening",
    area: "core",
    title: "Core hardening",
    phase: 0,
    access: "public",
    summary: "Data integrity, environment handling, debug-surface removal and pagination for the existing foundation.",
    parts: [
      { label: "Opportunity type/delivery mappers (no silent coercion)", status: "implemented" },
      { label: "Environment helper; header, mobile nav, data layer, admin, saved and applications degrade without Supabase env", status: "implemented" },
      { label: "Debug route /admin-check, stale lib/types.js and header debug logging removed", status: "implemented" },
      { label: "Server-side paginated + filtered query (getOpportunitiesPage)", status: "implemented" },
      { label: "Explicit column list instead of select(*)", status: "implemented" },
      { label: "Opportunity browser switched to server-side filtering", status: "pending", note: "Browser still filters client-side (9 per page)." },
      { label: "Verification & publication gate", status: "blocked", note: "Needs phase2-verification-preflight.sql output." },
      { label: "Application status alignment", status: "blocked", note: "Needs applications.status constraint from preflight." },
    ],
    dependencies: ["phase2-verification-preflight.sql results (blocked parts)"],
    acceptance: [
      "No opportunity type or delivery mode is displayed as a different value than stored",
      "Site renders (empty/error states) when Supabase env is missing",
      "Public reads request only listed columns",
      "Search terms cannot alter the PostgREST filter",
    ],
    todos: [
      "TODO(core): convert components/opportunities/opportunity-browser.tsx to getOpportunitiesPage with URL search params",
      "TODO(core): add spec categories (research, exchange, summer school, jobs, entrepreneurship, grants) to the admin form and opportunityTypes",
      "TODO(core): run preflight, review 001 + 009 proposals, then build the reviewer workflow",
    ],
    files: ["lib/env.ts", "lib/opportunities/mappers.ts", "lib/opportunities/search.ts", "lib/data/opportunities.ts"],
    tests: ["tests/scaffold-core.test.cjs"],
    migration: "001_verification_gate.sql",
  },
  // ─────────────────── 2. Opportunity intelligence ───────────────────
  {
    id: "opportunity-compare",
    area: "intelligence",
    title: "Opportunity comparison",
    phase: 3,
    route: "/compare",
    access: "public",
    summary: "Compare 2–4 published opportunities side by side (shareable URL).",
    parts: [
      { label: "ID parsing, validation and 4-item cap", status: "implemented" },
      { label: "Comparison table with differing rows highlighted", status: "implemented" },
      { label: "Searchable picker (server-side)", status: "implemented" },
      { label: "Compare buttons on cards and detail page", status: "pending" },
      { label: "Saved comparisons for signed-in users", status: "pending", note: "Needs a table; not proposed yet." },
    ],
    dependencies: [],
    acceptance: ["2–4 valid published opportunities render in one table", "Invalid or unpublished IDs are ignored with a notice", "Works without JavaScript"],
    todos: ["TODO(intelligence): add 'Compare' entry points to OpportunityCard and the detail page"],
    files: ["lib/opportunities/compare.ts", "app/compare/page.tsx", "components/compare/comparison-table.tsx", "components/compare/compare-picker.tsx"],
    tests: ["tests/scaffold-core.test.cjs"],
  },
  {
    id: "deadline-intelligence",
    area: "intelligence",
    title: "Deadline tracking",
    phase: 3,
    route: "/deadlines",
    access: "public",
    summary: "Upcoming deadlines, closing-soon flags and competing-deadline clusters; signed-in users also see their tracked applications.",
    parts: [
      { label: "Upcoming opportunity deadlines (60 days)", status: "implemented" },
      { label: "Closing-soon classification", status: "implemented" },
      { label: "Overlap clusters (deadlines within 3 days)", status: "implemented" },
      { label: "My application deadlines (signed in)", status: "implemented" },
      { label: "Preparation-time estimate and recommended start date", status: "pending", note: "Needs profile + checklist data." },
      { label: "Deadline-change alerts", status: "pending", note: "Needs notifications + change history." },
    ],
    dependencies: ["notifications (change alerts)"],
    acceptance: ["Past deadlines are never listed as upcoming", "Clusters only contain 2+ items", "Signed-out users see no personal data"],
    todos: ["TODO(intelligence): effort model for start-date recommendations once checklist templates exist"],
    files: ["lib/opportunities/deadlines.ts", "app/deadlines/page.tsx", "components/deadlines/deadline-list.tsx"],
    tests: ["tests/scaffold-core.test.cjs"],
  },
  {
    id: "dashboard",
    area: "intelligence",
    title: "Basic dashboard",
    phase: 3,
    route: "/dashboard",
    access: "user",
    summary: "Signed-in overview: saved/application counts, upcoming deadlines and rule-based next actions.",
    parts: [
      { label: "Saved and application counts", status: "implemented" },
      { label: "Upcoming application deadlines", status: "implemented" },
      { label: "Rule-based next actions (explainable, not AI)", status: "implemented" },
      { label: "Recommended opportunities", status: "pending", note: "Needs profile + matching." },
      { label: "Learning progress and goals", status: "pending", note: "Needs academy + goals tables." },
      { label: "Missing documents", status: "pending", note: "Needs document vault." },
    ],
    dependencies: ["profile", "documents", "academy", "find-ai"],
    acceptance: ["Requires sign-in", "Shows only the signed-in user's data", "Empty and error states render"],
    todos: ["TODO(intelligence): replace placeholder widgets as dependent features ship"],
    files: ["lib/dashboard/next-actions.ts", "app/dashboard/page.tsx"],
    tests: ["tests/scaffold-core.test.cjs"],
  },
  // ───────────────── 3. Profiles and personalization ─────────────────
  {
    id: "profile",
    area: "personalization",
    title: "User profile and preferences",
    phase: 3,
    route: "/profile",
    access: "user",
    summary: "Reusable personal, academic, professional and preference data (one profile, many applications).",
    parts: [
      { label: "Data model types", status: "scaffolded" },
      { label: "Service interface with auth guard", status: "scaffolded" },
      { label: "Route (gated, explains status)", status: "scaffolded" },
      { label: "Proposed migration (profiles, profile_entries)", status: "scaffolded" },
      { label: "Profile form and persistence", status: "pending" },
      { label: "Completion score", status: "pending", note: "Define required fields with product first." },
      { label: "CV import / LinkedIn import", status: "pending" },
      { label: "Public/private controls and export", status: "pending" },
    ],
    dependencies: ["Approved migration 002", "Document vault (CV import)"],
    acceptance: ["Owner-only read/write enforced by RLS", "No inferred or fabricated fields", "Public view exposes only an allow-listed column set"],
    todos: [
      "TODO(profile): form + server action using profileService",
      "TODO(profile): public_profiles view with allow-listed columns (never expose date_of_birth or phone)",
    ],
    files: ["lib/models/profile.ts", "lib/services/profile.ts", "lib/ecosystem/pages-core.ts"],
    migration: "002_profiles.sql",
    models: ["Profile", "ProfileEntry", "ProfilePreferences"],
    serviceMethods: ["getMyProfile()", "saveMyProfile(input)", "listMyEntries()", "saveEntry(input)", "deleteEntry(id)", "exportMyData()"],
  },
  // ─────────────────── 4. Alerts and notifications ───────────────────
  {
    id: "notification-preferences",
    area: "notifications",
    title: "Notification preferences",
    phase: 3,
    route: "/settings/notifications",
    access: "user",
    summary: "Per-channel, per-category consent and opt-outs.",
    parts: [
      { label: "Model and service interface", status: "scaffolded" },
      { label: "Route", status: "scaffolded" },
      { label: "Proposed migration (notification_preferences)", status: "scaffolded" },
      { label: "Preferences UI and persistence", status: "pending" },
    ],
    dependencies: ["Approved migration 003"],
    acceptance: ["Channels default to off except in-app", "Push/WhatsApp require recorded consent", "Opt-out takes effect immediately"],
    todos: ["TODO(notifications): preference form and action"],
    files: ["lib/models/notification.ts", "lib/services/notifications.ts", "lib/ecosystem/pages-core.ts"],
    migration: "003_notifications.sql",
    models: ["NotificationPreference", "NotificationCategory", "NotificationChannel"],
    serviceMethods: ["getPreferences()", "setPreference(channel, category, enabled)"],
  },
  {
    id: "notification-center",
    area: "notifications",
    title: "Notification center and delivery",
    phase: 3,
    route: "/notifications",
    access: "user",
    summary: "In-app inbox plus a delivery-channel interface for email/push/WhatsApp.",
    parts: [
      { label: "Delivery channel interface and dedupe-key helper", status: "implemented", note: "Pure helper only; no delivery happens." },
      { label: "Model and service interface", status: "scaffolded" },
      { label: "Route", status: "scaffolded" },
      { label: "Proposed migration (notifications)", status: "scaffolded" },
      { label: "Inbox UI, mark-as-read", status: "pending" },
      { label: "Email delivery provider", status: "blocked", note: "Needs provider decision and credentials." },
      { label: "Push / WhatsApp", status: "blocked", note: "Needs provider, consent flow and compliance review." },
    ],
    dependencies: ["Approved migration 003", "Email provider decision"],
    acceptance: ["Duplicate events collapse via dedupe key", "Users only read their own notifications", "Writes happen server-side only"],
    todos: ["TODO(notifications): worker/cron to evaluate alert rules and enqueue notifications"],
    files: ["lib/notifications/dedupe.ts", "lib/notifications/delivery.ts", "lib/services/notifications.ts", "lib/ecosystem/pages-core.ts"],
    tests: ["tests/scaffold-core.test.cjs"],
    migration: "003_notifications.sql",
    models: ["Notification"],
    serviceMethods: ["listMyNotifications(opts)", "markRead(id)", "markAllRead()"],
  },
  {
    id: "alert-rules",
    area: "notifications",
    title: "Alert rules and watchlists",
    phase: 3,
    route: "/alerts",
    access: "user",
    summary: "User-defined criteria (e.g. fully funded research in a country) that notify on new matches.",
    parts: [
      { label: "Rule criteria model and service interface", status: "scaffolded" },
      { label: "Route", status: "scaffolded" },
      { label: "Proposed migration (alert_rules)", status: "scaffolded" },
      { label: "Rule builder UI", status: "pending" },
      { label: "Rule evaluation job", status: "pending" },
    ],
    dependencies: ["Approved migration 003", "notification-center"],
    acceptance: ["Rules validated server-side against a fixed criteria schema", "Per-user rule cap", "Evaluation is idempotent"],
    todos: ["TODO(alerts): criteria schema reuse with getOpportunitiesPage filters"],
    files: ["lib/models/notification.ts", "lib/services/notifications.ts", "lib/ecosystem/pages-core.ts"],
    migration: "003_notifications.sql",
    models: ["AlertRule", "AlertCriteria"],
    serviceMethods: ["listRules()", "createRule(input)", "setRuleActive(id, active)", "deleteRule(id)"],
  },
  // ─────────────────────────── 5. Documents ───────────────────────────
  {
    id: "documents",
    area: "documents",
    title: "Document vault",
    phase: 5,
    route: "/documents",
    access: "user",
    summary: "Private document storage with versions, expiry, categories and per-application approval.",
    parts: [
      { label: "Upload policy (types, size, categories, path builder)", status: "implemented", note: "Pure validation only; nothing is stored." },
      { label: "Model and service interface", status: "scaffolded" },
      { label: "Route", status: "scaffolded" },
      { label: "Proposed migration + private bucket policies", status: "scaffolded" },
      { label: "Upload/preview/download UI", status: "pending" },
      { label: "Malware scanning", status: "blocked", note: "Needs scanning service decision." },
      { label: "AI extraction and classification", status: "pending", note: "Depends on find-ai." },
    ],
    dependencies: ["Approved migration 004", "Storage bucket creation", "Scanning decision"],
    acceptance: ["Bucket is private; access only via short-lived signed URLs", "Owner-only RLS", "Never log document contents", "User approves each document per application"],
    todos: ["TODO(documents): signed-URL server action with TTL from lib/documents/policy.ts"],
    files: ["lib/documents/policy.ts", "lib/models/document.ts", "lib/services/documents.ts", "lib/ecosystem/pages-core.ts"],
    tests: ["tests/scaffold-core.test.cjs"],
    migration: "004_documents.sql",
    models: ["VaultDocument", "DocumentVersion", "ApplicationDocument"],
    serviceMethods: ["listDocuments()", "requestUpload(meta)", "getSignedUrl(id)", "replaceDocument(id, meta)", "deleteDocument(id)", "approveForApplication(documentId, applicationId)"],
  },
  // ──────────────────────────── 6. Find AI ────────────────────────────
  {
    id: "find-ai",
    area: "ai",
    title: "Find AI hub and agents",
    phase: 4,
    route: "/ai",
    access: "user",
    summary: "Specialized agents with limited permissions, a provider interface, guardrails and audit logging.",
    parts: [
      { label: "Agent registry with permitted data and approval rules", status: "implemented", note: "Declarative; no model calls." },
      { label: "Guardrail constants (no fabrication, approval before submit)", status: "implemented" },
      { label: "Provider interface and audit event types", status: "scaffolded" },
      { label: "Service interface and route", status: "scaffolded" },
      { label: "Proposed migration (ai_audit_log, ai_memory, ai_usage_daily)", status: "scaffolded" },
      { label: "Provider implementation (server-side)", status: "blocked", note: "Needs provider choice, key management, cost limits." },
      { label: "Matching / eligibility / readiness / gap / roadmap agents", status: "pending" },
      { label: "Application Agent", status: "blocked", note: "Needs document vault, approval UI and legal review." },
      { label: "Locate and merge the hackathon Find AI MVP", status: "pending" },
    ],
    dependencies: ["Approved migration 005", "AI provider decision", "profile", "verified opportunity data"],
    acceptance: ["Keys only server-side", "Per-user rate limit and cost cap", "Every call audited without raw document content", "No agent can submit an application", "Outputs labelled with uncertainty and sources"],
    todos: ["TODO(ai): implement AiProvider; start with eligibility (grounded in verified opportunity fields)"],
    files: ["lib/ai/agents.ts", "lib/ai/guardrails.ts", "lib/ai/provider.ts", "lib/ai/audit.ts", "lib/models/ai.ts", "lib/services/ai.ts", "lib/ecosystem/pages-ai.ts"],
    tests: ["tests/scaffold-core.test.cjs"],
    migration: "005_ai.sql",
    models: ["AiAgentSpec", "AiAuditEvent", "AiMemoryItem"],
    serviceMethods: ["listAgents()", "runAgent(agentId, input)", "listMyMemory()", "deleteMemoryItem(id)"],
  },
  // ─────────────────────────── 7. Academy ───────────────────────────
  {
    id: "academy",
    area: "academy",
    title: "Find Academy",
    phase: 6,
    route: "/academy",
    access: "public",
    summary: "Courses, lessons, enrollment, progress and certificates.",
    parts: [
      { label: "Models and service interface", status: "scaffolded" },
      { label: "Catalog route", status: "scaffolded" },
      { label: "Proposed migration (courses, modules, lessons, enrollments, progress, certificates)", status: "scaffolded" },
      { label: "Catalog, enrollment and progress UI", status: "pending" },
      { label: "Assessments and assignments", status: "pending", note: "Not yet proposed in schema." },
      { label: "Course authoring (admin)", status: "pending" },
    ],
    dependencies: ["Approved migration 006", "Content plan"],
    acceptance: ["Only published courses are public", "Progress and certificates are owner-only", "Certificate verification code is unique"],
    todos: ["TODO(academy): admin authoring before any public catalog"],
    files: ["lib/models/academy.ts", "lib/services/academy.ts", "lib/ecosystem/pages-academy.ts"],
    migration: "006_academy.sql",
    models: ["Course", "CourseModule", "Lesson", "Enrollment", "LessonProgress", "Certificate"],
    serviceMethods: ["listPublishedCourses(opts)", "getCourseBySlug(slug)", "enroll(courseId)", "markLessonComplete(lessonId)", "getMyProgress()"],
  },
  {
    id: "academy-course",
    area: "academy",
    title: "Course detail",
    phase: 6,
    route: "/academy/courses/[slug]",
    access: "public",
    summary: "Course detail page.",
    parts: [
      { label: "Route (slug validated, no data lookup yet)", status: "scaffolded" },
      { label: "Course content rendering", status: "pending" },
    ],
    dependencies: ["academy"],
    acceptance: ["Unknown or unpublished slug returns 404"],
    todos: ["TODO(academy): load via academyService.getCourseBySlug"],
    files: ["lib/ecosystem/pages-academy.ts"],
  },
  // ──────────────────── 8. Community and mentors ────────────────────
  {
    id: "community",
    area: "community",
    title: "Community spaces",
    phase: 7,
    route: "/community",
    access: "public",
    summary: "Interest/goal/opportunity communities with posts, comments, reporting and moderation.",
    parts: [
      { label: "Models and service interface", status: "scaffolded" },
      { label: "Route", status: "scaffolded" },
      { label: "Proposed migration (communities, members, posts, comments, reports)", status: "scaffolded" },
      { label: "Spaces, posting and moderation UI", status: "pending" },
      { label: "Moderation queue (admin)", status: "pending" },
    ],
    dependencies: ["Approved migration 007", "Moderation policy", "profile"],
    acceptance: ["Posts require membership", "Reports reach a moderation queue", "Hidden content is not publicly readable"],
    todos: ["TODO(community): moderation tooling before opening posting"],
    files: ["lib/models/community.ts", "lib/services/community.ts", "lib/ecosystem/pages-connect.ts"],
    migration: "007_community_mentors.sql",
    models: ["Community", "CommunityMember", "Post", "Comment", "ContentReport"],
    serviceMethods: ["listCommunities()", "join(communityId)", "createPost(input)", "reportContent(input)"],
  },
  {
    id: "mentors",
    area: "community",
    title: "Mentors and sessions",
    phase: 7,
    route: "/mentors",
    access: "public",
    summary: "Verified mentor profiles, discovery, booking and session history.",
    parts: [
      { label: "Models and service interface", status: "scaffolded" },
      { label: "Route", status: "scaffolded" },
      { label: "Proposed migration (mentor_profiles, mentor_sessions)", status: "scaffolded" },
      { label: "Discovery, booking and calendar UI", status: "pending" },
      { label: "Mentor verification workflow", status: "pending" },
    ],
    dependencies: ["Approved migration 007", "Verification policy", "Calendar provider decision"],
    acceptance: ["Only verified mentors are listed publicly", "Session notes visible only to participants"],
    todos: ["TODO(mentors): never display credentials that were not verified"],
    files: ["lib/models/community.ts", "lib/services/community.ts", "lib/ecosystem/pages-connect.ts"],
    migration: "007_community_mentors.sql",
    models: ["MentorProfile", "MentorSession"],
    serviceMethods: ["listVerifiedMentors(opts)", "requestSession(input)", "listMySessions()"],
  },
  {
    id: "success-stories",
    area: "community",
    title: "Success stories",
    phase: 7,
    route: "/success-stories",
    access: "public",
    summary: "Structured, evidence-backed case studies (never fabricated).",
    parts: [
      { label: "Model and service interface", status: "scaffolded" },
      { label: "Route", status: "scaffolded" },
      { label: "Proposed migration (success_stories)", status: "scaffolded" },
      { label: "Submission, review and listing UI", status: "pending" },
    ],
    dependencies: ["Approved migration 007", "Editorial review process"],
    acceptance: ["Only reviewed stories are public", "Evidence/consent recorded per story"],
    todos: ["TODO(stories): no placeholder or invented stories in production"],
    files: ["lib/models/community.ts", "lib/services/community.ts", "lib/ecosystem/pages-connect.ts"],
    migration: "007_community_mentors.sql",
    models: ["SuccessStory"],
    serviceMethods: ["listPublishedStories(opts)", "submitStory(input)"],
  },
  // ──────────────────────────── 9. Institutions ────────────────────────────
  {
    id: "institutions",
    area: "institutions",
    title: "Institution profiles and portal",
    phase: 9,
    route: "/institutions",
    access: "public",
    summary: "Organization and university profiles with member roles; portal comes later.",
    parts: [
      { label: "Models and service interface", status: "scaffolded" },
      { label: "Route", status: "scaffolded" },
      { label: "Proposed migration (institutions, institution_members)", status: "scaffolded" },
      { label: "Institution onboarding and verification", status: "pending" },
      { label: "Opportunity publishing by institutions", status: "blocked", note: "Must go through the verification gate first." },
      { label: "Analytics for institutions", status: "pending" },
    ],
    dependencies: ["Approved migrations 001 and 008", "Verification gate"],
    acceptance: ["Members only access their own institution", "Institution-created opportunities still require verification"],
    todos: ["TODO(institutions): role model (owner/admin/editor/viewer) enforced in RLS, not UI"],
    files: ["lib/models/institution.ts", "lib/services/institutions.ts", "lib/ecosystem/pages-orgs.ts"],
    migration: "008_institutions.sql",
    models: ["Institution", "InstitutionMember"],
    serviceMethods: ["getMyInstitutions()", "createInstitution(input)", "inviteMember(input)", "updateInstitution(id, input)"],
  },
  {
    id: "admin-institutions",
    area: "institutions",
    title: "Institution management (admin)",
    phase: 9,
    route: "/admin/institutions",
    access: "admin",
    summary: "Admin review and verification of institutions.",
    parts: [
      { label: "Route (admin only)", status: "scaffolded" },
      { label: "Review/verify/suspend actions", status: "pending" },
    ],
    dependencies: ["institutions"],
    acceptance: ["Admin-only, enforced server-side", "Every status change is audit-logged"],
    todos: ["TODO(institutions): audit log table (see 001 proposal)"],
    files: ["lib/ecosystem/pages-orgs.ts"],
  },
  // ───────────── Application lifecycle (core platform) ─────────────
  {
    id: "application-transitions",
    area: "applications",
    title: "Application status transitions",
    phase: 1,
    access: "user",
    summary: "Valid status transitions enforced on the server, with the UI offering only valid next statuses.",
    parts: [
      { label: "Transition rules (pure) with unit tests", status: "implemented" },
      { label: "Server-side enforcement with optimistic concurrency (updateApplicationAction)", status: "implemented" },
      { label: "Status select offers only the current and valid next statuses", status: "implemented", note: "Not exercised in a browser." },
      { label: "Nothing can be moved into legacy 'saved'", status: "implemented" },
      { label: "ready_to_apply / under_review / withdrawn statuses", status: "blocked", note: "Needs migration 009 and the applications constraint from preflight." },
      { label: "Migrating legacy 'saved' application rows", status: "blocked", note: "Needs preflight data counts and an approved data-migration plan." },
      { label: "Integration test against a real database", status: "pending" },
    ],
    dependencies: ["phase2-applications-preflight.sql", "Approved migration 009"],
    acceptance: [
      "An invalid transition is rejected server-side with a clear message",
      "A concurrent status change is not silently overwritten",
      "No code path creates a new 'saved' application status",
    ],
    todos: ["TODO(applications): add the three product statuses to transitions.ts together with migration 009"],
    files: ["lib/applications/transitions.ts", "app/applications/actions.ts", "components/applications/application-manager.tsx"],
    tests: ["tests/application-transitions.test.cjs"],
  },
  // ───────────── Find AI Agent v1 (grounded retrieval) ─────────────
  {
    id: "agent-core",
    area: "ai",
    title: "Find AI Agent v1 (grounded retrieval)",
    phase: 3,
    access: "public",
    summary: "Read-only central agent: intent detection, permission-aware tools, and replies built only from published opportunities and the user's own applications. No language model is called.",
    parts: [
      { label: "Rule-based intent and entity detection", status: "implemented" },
      { label: "Permission-aware, read-only tool registry (no write/submit tools exist)", status: "implemented" },
      { label: "Orchestrator: search, explain, compare, deadlines, my applications, human-support honesty", status: "implemented" },
      { label: "Eligibility view: lists requirements, marks each 'not checked', never concludes", status: "implemented", note: "Real checking needs verified profile data (profile feature)." },
      { label: "Request validation, same-origin check, in-memory rate limit", status: "implemented", note: "Rate limit is per server instance; a shared store is pending." },
      { label: "Deterministic behaviour tests (permissions, grounding, no-invention)", status: "implemented" },
      { label: "LLM provider for phrasing/classification", status: "needs_config", note: "Provider choice, server-side key and cost limits." },
      { label: "Retrieval over documents (RAG) and Document Intelligence", status: "pending" },
      { label: "Server-side conversation history, user memory, audit log, token/cost monitoring", status: "blocked", note: "Needs migration 005 (and a conversations table: not yet proposed)." },
      { label: "Shared rate-limit store", status: "pending" },
      { label: "Matching, readiness, gap, roadmap, CV, essay, interview agents", status: "blocked", note: "Need profile, documents and academy data." },
      { label: "LLM evaluation suite and prompt versioning", status: "pending", note: "No prompts exist yet." },
    ],
    dependencies: ["Published opportunity data (trust depends on the verification gate)", "Migration 005", "AI provider decision", "profile"],
    acceptance: [
      "Every statement comes from a tool result",
      "Guests cannot read private data; no tool can write or submit",
      "Eligibility is never asserted without verified user data",
      "Outage produces an explicit 'cannot reach data' reply, not a guess",
    ],
    todos: ["TODO(ai): provider phrasing layer must not add facts; add golden conversations once a model is configured"],
    files: ["lib/agent/types.ts", "lib/agent/intent.ts", "lib/agent/orchestrator.ts", "lib/agent/tool-registry.ts", "lib/agent/rate-limit.ts", "lib/agent/request.ts", "lib/agent/server/tools.ts", "app/api/chat/route.ts"],
    tests: ["tests/agent-core.test.cjs"],
  },
  // ───────────── Find Chatbot ─────────────
  {
    id: "website-chatbot",
    area: "chatbot",
    title: "Website chatbot",
    phase: 4,
    access: "public",
    summary: "Floating chat widget on top of the agent. Hidden unless NEXT_PUBLIC_ENABLE_CHATBOT=true (build-time).",
    parts: [
      { label: "Chat API (POST /api/chat): validation, same-origin, rate limit, auth-aware", status: "implemented", note: "Verified by runtime probes against a built server." },
      { label: "Widget: button, dialog, typing indicator, starters, cards, links, retry, new conversation", status: "implemented", note: "Typechecked and built; not exercised in a browser." },
      { label: "Transcript kept in this browser tab only (sessionStorage)", status: "implemented" },
      { label: "Server-side conversation history", status: "blocked", note: "Needs a conversations migration (not yet proposed)." },
      { label: "Feedback buttons", status: "blocked", note: "Needs storage for feedback." },
      { label: "File upload in chat", status: "pending", note: "Depends on the document vault." },
      { label: "Human support handoff", status: "pending", note: "No support channel exists; the bot says so and sends nothing." },
      { label: "Admin: conversation management, knowledge sources, analytics", status: "blocked", note: "Needs storage and the admin roles model." },
    ],
    dependencies: ["agent-core", "Conversation storage migration", "Support channel decision"],
    acceptance: ["Widget never renders on /admin", "Keyboard accessible (Escape closes, labelled controls, live region)", "No message content is logged"],
    todos: ["TODO(chatbot): browser/E2E test; decide whether the flag defaults on at launch"],
    files: ["components/chat/chat-widget.tsx", "app/api/chat/route.ts", "app/layout.tsx"],
    tests: ["tests/agent-core.test.cjs"],
  },
  {
    id: "whatsapp-channel",
    area: "chatbot",
    title: "WhatsApp channel",
    phase: 4,
    access: "public",
    summary: "Webhook architecture and provider abstraction. NOT live: needs a Meta app, business number, credentials and a public HTTPS URL.",
    parts: [
      { label: "Webhook handshake, HMAC signature verification, payload normalisation, reply formatting", status: "implemented", note: "Unit-tested." },
      { label: "Webhook handler: inert without config, dedupe, per-sender rate limit, never fails the webhook", status: "implemented", note: "Unit-tested with injected fakes." },
      { label: "Graph API sender (provider abstraction)", status: "needs_config", note: "Never called against the real API." },
      { label: "Live end-to-end verification (webhook registration, send, receive)", status: "needs_config" },
      { label: "Secure account linking and consent records", status: "blocked", note: "Needs a migration; until then WhatsApp is guest-only." },
      { label: "Application status and reminders over WhatsApp", status: "blocked", note: "Needs account linking and notification delivery." },
      { label: "Human support handoff, media messages, Telegram and other channels", status: "pending" },
    ],
    dependencies: ["agent-core", "Meta Business account and credentials", "Account-linking migration", "notification-center"],
    acceptance: ["Returns 503 until fully configured", "Unsigned or badly signed requests are rejected before processing", "Guest-only: no private data over WhatsApp"],
    todos: ["TODO(whatsapp): follow docs/WHATSAPP_INTEGRATION.md; confirm the current Graph API version in Meta's docs"],
    files: ["lib/channels/whatsapp.ts", "lib/channels/whatsapp-handler.ts", "app/api/webhooks/whatsapp/route.ts"],
    tests: ["tests/agent-core.test.cjs"],
  },
  // ───────────────────────────── Admin ─────────────────────────────
  {
    id: "admin-features",
    area: "admin",
    title: "Feature status board",
    phase: 0,
    route: "/admin/features",
    access: "admin",
    summary: "Live view of this registry for the team (admin only).",
    parts: [{ label: "Registry-driven status board", status: "implemented" }],
    dependencies: [],
    acceptance: ["Admin-only", "Counts match registry"],
    todos: [],
    files: ["app/admin/features/page.tsx", "lib/features/registry.ts"],
    tests: ["tests/scaffold-core.test.cjs"],
  },
];

export const features: FeatureSpec[] = input.map((feature) => ({
  ...feature,
  status: deriveStatus(feature.parts),
}));

export function getFeature(id: string): FeatureSpec | undefined {
  return features.find((feature) => feature.id === id);
}

export function summarizeFeatures(list: FeatureSpec[] = features) {
  const counts: Record<FeatureStatus, number> = {
    implemented: 0,
    partial: 0,
    scaffolded: 0,
    pending: 0,
    blocked: 0,
    needs_config: 0,
  };

  for (const feature of list) counts[feature.status] += 1;

  return counts;
}
