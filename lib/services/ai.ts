import type { AgentId, AiAgentSpec } from "@/lib/ai/agents";
import { agents } from "@/lib/ai/agents";
import type { AiMemoryItem } from "@/lib/models/ai";
import { unimplemented } from "@/lib/services/guard";
import { ok, type ServiceResult } from "@/lib/services/result";

/**
 * SCAFFOLDED. TODO(ai): runAgent must (1) require auth, (2) enforce the agent's
 * permittedData, (3) rate-limit and cost-cap, (4) call getAiProvider() (null =>
 * not_configured), (5) write an audit event via lib/ai/audit.ts. Agents never submit applications.
 */
export interface AiService {
  listAgents(): Promise<ServiceResult<readonly AiAgentSpec[]>>;
  runAgent(agentId: AgentId, input: string): Promise<ServiceResult<{ text: string }>>;
  listMyMemory(): Promise<ServiceResult<AiMemoryItem[]>>;
  deleteMemoryItem(id: string): Promise<ServiceResult<null>>;
}

export const aiService: AiService = {
  // The registry is static public metadata, so listing it needs no database.
  listAgents: async () => ok(agents),
  runAgent: () => unimplemented("Find AI"),
  listMyMemory: () => unimplemented("AI memory"),
  deleteMemoryItem: () => unimplemented("AI memory"),
};
