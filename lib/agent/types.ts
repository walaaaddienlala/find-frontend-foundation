import type { FundingType, Opportunity, OpportunityType } from "../types";

/** Shared agent types. IMPLEMENTED. The agent is read-only: no tool writes data or submits anything. */
export type Intent =
  | "greeting"
  | "help"
  | "search_opportunities"
  | "explain_opportunity"
  | "compare"
  | "deadlines"
  | "eligibility"
  | "my_applications"
  | "human_support"
  | "unknown";

export type AgentSession = { userId: string | null };

export type Entities = {
  types: OpportunityType[];
  country: string | null;
  funding: FundingType | null;
  /** Free-text topic words left after removing intent/entity words. */
  query: string;
};

export type OpportunityCard = {
  id: string;
  title: string;
  organization: string;
  type: OpportunityType;
  country: string;
  deadline: string;
  fundingType: FundingType;
  href: string;
};

export type ReplyLink = { label: string; href: string };

export type AgentReply = {
  intent: Intent;
  text: string;
  cards: OpportunityCard[];
  links: ReplyLink[];
  suggestions: string[];
  /** true only when every factual statement came from a tool result. */
  grounded: boolean;
  requiresSignIn?: boolean;
  handoff?: { requested: boolean; available: boolean };
};

export type SearchParams = {
  query: string;
  type: OpportunityType | null;
  country: string | null;
  funding: FundingType | null;
  limit: number;
};

export type MyApplication = {
  id: string;
  title: string;
  status: string;
  deadline: string | null;
  progress: number;
};

export type ToolResult<T> = { ok: true; data: T } | { ok: false };

/** Dependencies injected by the caller. The agent never touches the database directly. */
export type AgentTools = {
  searchOpportunities(params: SearchParams): Promise<ToolResult<Opportunity[]>>;
  listPublished(): Promise<ToolResult<Opportunity[]>>;
  myApplications(): Promise<ToolResult<MyApplication[]>>;
};
