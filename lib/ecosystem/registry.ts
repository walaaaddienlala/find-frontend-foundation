import { aiPages } from "./pages-ai";
import { academyPages } from "./pages-academy";
import { communityPages, eventPages, mentorPages, networkPages, resourcePages, storyPages, teamPages } from "./pages-connect";
import { growPages, opportunityPages, platformPages, profilePages, rolePages } from "./pages-core";
import { adminPages, agencyPages, orgPages, universityPages } from "./pages-orgs";
import { preparePages } from "./pages-prepare";
import type { ModuleId, PageDef } from "./types";

export const pages: PageDef[] = [
  ...platformPages, ...opportunityPages, ...profilePages, ...growPages, ...rolePages, ...aiPages, ...preparePages,
  ...academyPages, ...communityPages, ...mentorPages, ...storyPages, ...teamPages, ...eventPages, ...resourcePages,
  ...networkPages, ...agencyPages, ...orgPages, ...universityPages, ...adminPages,
];

export const moduleTitle: Record<ModuleId, string> = {
  platform: "Find Platform", opportunities: "Opportunities", profile: "Profile and Passports", ai: "Find AI", chatbot: "Find Chatbot",
  prepare: "Preparation Center", academy: "Find Academy", community: "Find Community", mentors: "Find Mentors", stories: "Someone Who Did It",
  teams: "Team Finder", events: "Find Events", resources: "Resource Library", network: "Find Network", agency: "Find Agency",
  organizations: "Organization Portal", universities: "University Portal", admin: "Admin Dashboard", roles: "Experiences by Role", grow: "Grow",
};

/** Root pages whose children form each module's sub-navigation. */
export const moduleRoots: Partial<Record<ModuleId, string[]>> = {
  profile: ["profile"], ai: ["ai"], chatbot: ["chat-hub"], prepare: ["prepare"], academy: ["academy", "academy-dashboard"],
  community: ["community"], mentors: ["mentors"], stories: ["stories", "swdi"], teams: ["teams"], events: ["events"],
  resources: ["resources"], network: ["network"], agency: ["agency"], organizations: ["organizations"], universities: ["universities"],
};

/** Backend work each module needs (the frontend is built; these are for the development team). */
export const moduleBackend: Record<ModuleId, string[]> = {
  platform: ["Profiles and onboarding persistence", "User settings, privacy and consent storage", "Notification preferences and notification center", "Data export and account deletion workflows", "Personalized feed ranking (needs profile + matching)"],
  opportunities: ["Server-side filtering and pagination in the opportunity browser", "Opportunity types beyond the current 9 (research, exchange, summer school, grants, jobs, entrepreneurship, incubators, accelerators, leadership)", "Verification and publication gate (migration 001)", "Source tracking, duplicate and expiry detection"],
  profile: ["profiles and profile_entries tables (migration 002) with owner-only RLS", "Allow-listed public profile view", "Private document storage, versions and scanning (migration 004)", "Skill and opportunity passport aggregation with evidence and verification"],
  ai: ["LLM provider, server-side keys, cost caps and per-user quotas", "Conversation storage, user-approved memory and audit log (migration 005 + conversations table)", "Retrieval over verified opportunities and user documents", "Per-tool services (matching, eligibility, readiness, gap, roadmap, CV, essay, interview) with grounding and no fabrication", "Evaluation suite and prompt versioning"],
  chatbot: ["Conversation and feedback storage", "Support handoff queue and human support console", "WhatsApp: Meta app, credentials, webhook registration, account linking and consent", "Telegram channel adapter"],
  prepare: ["Draft and checklist persistence", "CV builder export (PDF/DOCX)", "Mock-interview scheduling, recording and feedback", "AI feedback services (see Find AI)"],
  academy: ["Courses, modules, lessons, enrollments, progress, certificates (migration 006)", "Video hosting", "Assignments, quizzes and assessments tables", "Instructor authoring tools and cohort management"],
  community: ["Communities, membership, posts, comments, reports (migration 007)", "Moderation queue, roles and abuse prevention before public posting", "Events integration"],
  mentors: ["Mentor profiles, verification, sessions (migration 007)", "Availability, calendar integration and booking", "Reviews and feedback storage", "Matching service"],
  stories: ["Success story submission, consent, evidence and editorial review (migration 007)", "Question routing to contributors"],
  teams: ["Teams, membership and requests tables", "Teammate discovery with skills and availability (consent-based)"],
  events: ["Events, registration, attendance and recordings tables", "Email reminders and calendar sync", "Video hosting for recordings"],
  resources: ["Resource storage, versioning and download tracking", "Saved resources per user"],
  network: ["Network profiles and roles (alumni, ambassador, contributor, trainer, leader)", "Consent-based public listing"],
  agency: ["Service catalogue, requests, booking and client dashboard tables", "Payments only after a compliant provider, legal and security review"],
  organizations: ["Institutions and institution_members with tenant isolation (migration 008)", "Organization verification workflow", "Opportunity publishing through the verification gate", "Applicant intake with consent, talent discovery with explicit consent", "Organization analytics (aggregated)"],
  universities: ["Institutions with university role, departments and announcements tables", "Student engagement analytics (aggregated, privacy-preserving)", "University verification workflow"],
  admin: ["Admin role model beyond admin (reviewer, moderator, support)", "Audit log (migration 001)", "Real data behind user, organization, academy, moderation and support screens", "AI and chatbot configuration storage"],
  roles: ["Role-based access control for mentor, instructor, moderator, organization and university roles"],
  grow: ["Roadmaps, goals and progress persistence", "Cross-module progress aggregation"],
};

export function getPage(id: string): PageDef | undefined {
  return pages.find((page) => page.id === id);
}

export function childrenOf(id: string): PageDef[] {
  return pages.filter((page) => page.parent === id);
}

export function breadcrumbsFor(page: PageDef): PageDef[] {
  const chain: PageDef[] = [];
  let current: PageDef | undefined = page.parent ? getPage(page.parent) : undefined;

  while (current && chain.length < 4) {
    chain.unshift(current);
    current = current.parent ? getPage(current.parent) : undefined;
  }

  return chain;
}
