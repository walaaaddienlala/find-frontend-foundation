import type { AgentSession } from "./types";

/**
 * Permission-aware tool registry. IMPLEMENTED. Every tool is declared with an
 * access level and `readOnly: true`; the orchestrator must call `authorizeTool`
 * before executing any tool. There is intentionally no write or submit tool.
 */
export type ToolName = "search_opportunities" | "list_published" | "my_applications";

export type ToolSpec = {
  name: ToolName;
  description: string;
  access: "public" | "user";
  readOnly: true;
};

export const toolRegistry: readonly ToolSpec[] = [
  { name: "search_opportunities", description: "Search published opportunities by text, type and country.", access: "public", readOnly: true },
  { name: "list_published", description: "List published opportunities (used for deadlines and country detection).", access: "public", readOnly: true },
  { name: "my_applications", description: "Summarize the signed-in user's own tracked applications.", access: "user", readOnly: true },
];

export type ToolAuthorization = { allowed: true } | { allowed: false; reason: "sign_in_required" | "unknown_tool" };

export function authorizeTool(name: string, session: AgentSession): ToolAuthorization {
  const spec = toolRegistry.find((tool) => tool.name === name);

  if (!spec) return { allowed: false, reason: "unknown_tool" };
  if (spec.access === "user" && !session.userId) return { allowed: false, reason: "sign_in_required" };

  return { allowed: true };
}
