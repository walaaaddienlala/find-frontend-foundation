/**
 * Declarative registry of Find AI agents: responsibilities, permitted data and
 * approval rules. IMPLEMENTED as data only: there is no model call anywhere.
 * `canSubmitApplication` is typed as the literal `false`, so no agent can be
 * given submit rights without changing this type (and failing review/tests).
 */
export type AgentId =
  | "opportunity" | "matching" | "eligibility" | "readiness" | "gap-analysis"
  | "roadmap" | "document" | "cv" | "essay" | "application"
  | "interview" | "learning" | "career" | "assistant";

export type DataScope =
  | "public_web" | "opportunities_published" | "profile" | "applications"
  | "documents" | "ai_memory" | "learning_progress";

export type AiAgentSpec = {
  id: AgentId;
  name: string;
  purpose: string;
  permittedData: readonly DataScope[];
  canWriteUserData: boolean;
  canSubmitApplication: false;
  requiresUserApproval: boolean;
  phase: number;
  status: "pending" | "blocked";
  blockedBy?: string;
};

export const agents: readonly AiAgentSpec[] = [
  { id: "opportunity", name: "Opportunity Agent", purpose: "Discovers and analyzes opportunities for admin review (never publishes).", permittedData: ["public_web", "opportunities_published"], canWriteUserData: false, canSubmitApplication: false, requiresUserApproval: true, phase: 8, status: "pending" },
  { id: "matching", name: "Matching Agent", purpose: "Explains how opportunities fit a profile: strengths, gaps, next steps.", permittedData: ["opportunities_published", "profile"], canWriteUserData: false, canSubmitApplication: false, requiresUserApproval: false, phase: 4, status: "pending" },
  { id: "eligibility", name: "Eligibility Agent", purpose: "Compares stated requirements with user-provided facts; separates evidence from interpretation.", permittedData: ["opportunities_published", "profile"], canWriteUserData: false, canSubmitApplication: false, requiresUserApproval: false, phase: 4, status: "pending" },
  { id: "readiness", name: "Readiness Agent", purpose: "Estimates preparation progress (not acceptance probability).", permittedData: ["opportunities_published", "profile", "applications", "documents"], canWriteUserData: false, canSubmitApplication: false, requiresUserApproval: false, phase: 4, status: "pending" },
  { id: "gap-analysis", name: "Gap Analysis Agent", purpose: "Finds missing skills, documents and experience with practical actions.", permittedData: ["opportunities_published", "profile", "documents"], canWriteUserData: false, canSubmitApplication: false, requiresUserApproval: false, phase: 4, status: "pending" },
  { id: "roadmap", name: "Roadmap Agent", purpose: "Builds deadline-aware preparation plans.", permittedData: ["opportunities_published", "profile", "applications"], canWriteUserData: true, canSubmitApplication: false, requiresUserApproval: true, phase: 4, status: "pending" },
  { id: "document", name: "Document Agent", purpose: "Extracts and classifies content from user documents.", permittedData: ["documents"], canWriteUserData: true, canSubmitApplication: false, requiresUserApproval: true, phase: 5, status: "blocked", blockedBy: "document vault + scanning" },
  { id: "cv", name: "CV Agent", purpose: "Reviews and improves CV versions using only user-provided facts.", permittedData: ["profile", "documents"], canWriteUserData: true, canSubmitApplication: false, requiresUserApproval: true, phase: 5, status: "blocked", blockedBy: "document vault" },
  { id: "essay", name: "Essay Agent", purpose: "Drafts essays and statements; flags missing facts instead of inventing them.", permittedData: ["profile", "documents"], canWriteUserData: true, canSubmitApplication: false, requiresUserApproval: true, phase: 5, status: "blocked", blockedBy: "document vault" },
  { id: "application", name: "Application Agent", purpose: "Prepares drafts and form fills; the user reviews and submits.", permittedData: ["profile", "applications", "documents"], canWriteUserData: true, canSubmitApplication: false, requiresUserApproval: true, phase: 5, status: "blocked", blockedBy: "document vault + approval UI + legal review" },
  { id: "interview", name: "Interview Agent", purpose: "Runs mock interviews and gives feedback.", permittedData: ["profile", "opportunities_published"], canWriteUserData: false, canSubmitApplication: false, requiresUserApproval: false, phase: 5, status: "pending" },
  { id: "learning", name: "Learning Agent", purpose: "Recommends courses and practice from gaps and progress.", permittedData: ["profile", "learning_progress", "opportunities_published"], canWriteUserData: false, canSubmitApplication: false, requiresUserApproval: false, phase: 6, status: "blocked", blockedBy: "academy" },
  { id: "career", name: "Career Agent", purpose: "Explores pathways connecting goals, skills and opportunities.", permittedData: ["profile", "opportunities_published", "learning_progress"], canWriteUserData: false, canSubmitApplication: false, requiresUserApproval: false, phase: 8, status: "pending" },
  { id: "assistant", name: "Personal Assistant Agent", purpose: "Manages approved tasks and recommendations using user-approved memory.", permittedData: ["profile", "applications", "ai_memory"], canWriteUserData: true, canSubmitApplication: false, requiresUserApproval: true, phase: 8, status: "pending" },
];

export function getAgent(id: string): AiAgentSpec | undefined {
  return agents.find((agent) => agent.id === id);
}
