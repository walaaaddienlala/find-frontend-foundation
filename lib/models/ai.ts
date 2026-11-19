/** PROPOSED model for migration 005_ai.sql. */
export type AiAuditEvent = {
  id: string;
  userId: string;
  agent: string;
  action: string;
  status: "ok" | "refused" | "error";
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  /** Short, non-sensitive description. Never raw document or essay content. */
  inputSummary: string | null;
  createdAt: string;
};

/** Only user-approved facts. The user can inspect, edit and delete every item. */
export type AiMemoryItem = {
  id: string;
  key: string;
  value: string;
  source: "user_entered" | "user_approved_suggestion";
  createdAt: string;
};
