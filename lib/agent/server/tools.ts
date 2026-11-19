import { getUserApplications } from "@/lib/data/applications";
import { getOpportunities, getOpportunitiesPage } from "@/lib/data/opportunities";
import type { AgentSession, AgentTools } from "@/lib/agent/types";
import type { Opportunity } from "@/lib/types";

/**
 * Server-side tool implementations for the agent: READ-ONLY, built on the same
 * guarded data functions the website uses (published opportunities; the signed-in
 * user's own applications). The agent has no other data access.
 */
const LIST_TTL_MS = 60_000;
let listCache: { at: number; items: Opportunity[] } | null = null;

export function createAgentTools(session: AgentSession): AgentTools {
  return {
    async listPublished() {
      const now = Date.now();
      if (listCache && now - listCache.at < LIST_TTL_MS) return { ok: true, data: listCache.items };

      try {
        const items = await getOpportunities();
        // getOpportunities() returns [] on error as well as when empty; treat empty as unavailable only if never cached.
        listCache = { at: now, items };
        return { ok: true, data: items };
      } catch {
        return { ok: false };
      }
    },

    async searchOpportunities(params) {
      try {
        const page = await getOpportunitiesPage({
          query: params.query,
          type: params.type ?? undefined,
          country: params.country ?? undefined,
          pageSize: 50,
        });

        return page.ok ? { ok: true, data: page.items } : { ok: false };
      } catch {
        return { ok: false };
      }
    },

    async myApplications() {
      if (!session.userId) return { ok: false };

      try {
        const applications = await getUserApplications();

        return {
          ok: true,
          data: applications.map((application) => ({
            id: application.id,
            title: application.opportunity.title,
            status: application.status as string,
            deadline: application.applicationDeadline ?? application.opportunity.deadline,
            progress: application.preparationProgress,
          })),
        };
      } catch {
        return { ok: false };
      }
    },
  };
}
