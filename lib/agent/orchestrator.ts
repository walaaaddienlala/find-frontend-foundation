import { computeNextActions } from "../dashboard/next-actions";
import { formatDeadline } from "../format";
import { daysUntil, upcomingDeadlines } from "../opportunities/deadlines";
import { fundingTypeLabel } from "../opportunities/labels";
import type { Opportunity } from "../types";
import { normalizeHttpUrl } from "../validation/url";
import { detectEntities, detectIntent } from "./intent";
import { authorizeTool } from "./tool-registry";
import type {
  AgentReply,
  AgentSession,
  AgentTools,
  Entities,
  Intent,
  OpportunityCard,
  ReplyLink,
} from "./types";

/**
 * Find AI Agent v1 orchestrator. IMPLEMENTED in grounded-retrieval mode:
 *   message -> intent -> authorized read-only tools -> templated reply.
 * Every fact in a reply comes from a tool result (published opportunities or the
 * signed-in user's own applications). No model is called, nothing is generated
 * freehand, and nothing is written or submitted. An LLM provider can later be
 * added to PHRASE replies, but must not add facts (see docs/FIND_AI_AGENT_ARCHITECTURE.md).
 */
export const CONFIRM_NOTE =
  "These details come from Find’s published listings. Please confirm them on the official source before you apply.";

const MAX_CARDS = 5;

const HELP_SUGGESTIONS = [
  "Find fully funded scholarships",
  "Show deadlines closing soon",
  "Tell me about internships",
  "What are my application deadlines?",
];

function reply(partial: Partial<AgentReply> & Pick<AgentReply, "intent" | "text">): AgentReply {
  return { cards: [], links: [], suggestions: [], grounded: true, ...partial };
}

function toCard(opportunity: Opportunity): OpportunityCard {
  return {
    id: opportunity.id,
    title: opportunity.title,
    organization: opportunity.organization,
    type: opportunity.type,
    country: opportunity.country,
    deadline: opportunity.deadline,
    fundingType: opportunity.fundingType,
    href: `/opportunities/${opportunity.id}`,
  };
}

function typeLabel(type: string): string {
  return type.replace(/-/g, " ");
}

function unavailable(intent: Intent): AgentReply {
  return reply({
    intent,
    text: "I can’t reach Find’s opportunity data right now, so I won’t guess. Please try again in a moment, or browse the opportunities page.",
    links: [{ label: "Browse opportunities", href: "/opportunities" }],
    suggestions: HELP_SUGGESTIONS.slice(0, 2),
    grounded: false,
  });
}

type Matches = { ok: true; items: Opportunity[]; entities: Entities } | { ok: false };

async function findMatches(
  message: string,
  tools: AgentTools,
  now: Date,
  options: { excludePassed: boolean },
): Promise<Matches> {
  if (!authorizeTool("list_published", { userId: null }).allowed) return { ok: false };
  const published = await tools.listPublished();
  if (!published.ok) return { ok: false };

  const countries = Array.from(new Set(published.data.map((item) => item.country).filter(Boolean)));
  const entities = detectEntities(message, countries);

  if (!authorizeTool("search_opportunities", { userId: null }).allowed) return { ok: false };
  const searched = await tools.searchOpportunities({
    query: entities.query,
    type: entities.types.length === 1 ? entities.types[0] : null,
    country: entities.country,
    funding: entities.funding,
    limit: 20,
  });
  if (!searched.ok) return { ok: false };

  const items = searched.data.filter(
    (item) =>
      (entities.types.length === 0 || entities.types.includes(item.type)) &&
      (!entities.funding || item.fundingType === entities.funding) &&
      (!entities.country || item.country.toLowerCase() === entities.country.toLowerCase()) &&
      (!options.excludePassed || (daysUntil(item.deadline, now) ?? 0) >= 0),
  );

  return { ok: true, items, entities };
}

function describeFilters(entities: Entities): string {
  const parts = [
    entities.funding ? fundingTypeLabel[entities.funding].toLowerCase() : null,
    entities.types.length ? entities.types.map(typeLabel).join(" / ") : null,
    entities.country ? `in ${entities.country}` : null,
    entities.query ? `matching “${entities.query}”` : null,
  ].filter(Boolean);

  return parts.length ? parts.join(" ") : "";
}

function bullets(title: string, items: string[], max = 5): string {
  const shown = items.filter(Boolean).slice(0, max);
  return shown.length ? `${title}:\n${shown.map((item) => `• ${item}`).join("\n")}` : "";
}

function officialLinks(opportunity: Opportunity): ReplyLink[] {
  const links: ReplyLink[] = [{ label: "View on Find", href: `/opportunities/${opportunity.id}` }];
  const source = normalizeHttpUrl(opportunity.officialSourceUrl);
  const apply = normalizeHttpUrl(opportunity.applicationUrl);

  if (source) links.push({ label: "Official source", href: source });
  if (apply) links.push({ label: "Application page", href: apply });

  return links;
}

export async function runAgentTurn(input: {
  message: string;
  session: AgentSession;
  tools: AgentTools;
  now?: Date;
}): Promise<AgentReply> {
  const { message, session, tools } = input;
  const now = input.now ?? new Date();
  const intent = detectIntent(message);

  switch (intent) {
    case "greeting":
    case "help":
    case "unknown":
      return reply({
        intent,
        text: "Hi! I’m Find’s assistant. I can search published opportunities, explain them, compare them, show closing deadlines, and summarize your own applications once you’re signed in. I can’t submit applications or change your data.",
        suggestions: HELP_SUGGESTIONS,
      });

    case "human_support":
      return reply({
        intent,
        text: "Human support isn’t connected to this chat yet, so your request has not been sent to anyone. Please check back soon.",
        handoff: { requested: true, available: false },
        suggestions: HELP_SUGGESTIONS.slice(0, 2),
      });

    case "my_applications": {
      const auth = authorizeTool("my_applications", session);
      if (!auth.allowed) {
        return reply({
          intent,
          text: "Please sign in so I can show your own applications. I can’t share account information with signed-out visitors.",
          requiresSignIn: true,
          links: [{ label: "Sign in", href: "/sign-in?redirectTo=/dashboard" }],
        });
      }

      const mine = await tools.myApplications();
      if (!mine.ok) return unavailable(intent);
      if (mine.data.length === 0) {
        return reply({
          intent,
          text: "You aren’t tracking any applications yet. Start tracking one from an opportunity page to get a checklist and reminders.",
          links: [{ label: "Browse opportunities", href: "/opportunities" }],
        });
      }

      const actions = computeNextActions(mine.data, now, 3);
      const active = mine.data.filter((a) => ["saved", "preparing", "in_progress"].includes(a.status)).length;
      const lines = [`You’re tracking ${mine.data.length} application${mine.data.length === 1 ? "" : "s"} (${active} still being prepared).`];
      if (actions.length) lines.push(bullets("What needs attention", actions.map((a) => `${a.title}. ${a.detail}`)));

      return reply({
        intent,
        text: lines.join("\n\n"),
        links: [
          { label: "Open my applications", href: "/applications" },
          { label: "Open my dashboard", href: "/dashboard" },
        ],
      });
    }

    case "deadlines": {
      const published = await tools.listPublished();
      if (!published.ok) return unavailable(intent);

      const entities = detectEntities(message, Array.from(new Set(published.data.map((o) => o.country).filter(Boolean))));
      const pool = published.data.filter(
        (item) =>
          (entities.types.length === 0 || entities.types.includes(item.type)) &&
          (!entities.country || item.country.toLowerCase() === entities.country.toLowerCase()),
      );
      const soon = upcomingDeadlines(
        pool.map((item) => ({ id: item.id, title: item.title, deadline: item.deadline, kind: "opportunity" as const })),
        now,
        30,
      ).slice(0, MAX_CARDS);

      if (soon.length === 0) {
        return reply({
          intent,
          text: "No published opportunities are closing in the next 30 days for that search.",
          links: [{ label: "See all deadlines", href: "/deadlines" }],
        });
      }

      const byId = new Map(pool.map((item) => [item.id, item]));
      return reply({
        intent,
        text: `${soon.length} published opportunit${soon.length === 1 ? "y closes" : "ies close"} within 30 days:\n\n${soon
          .map((item) => `• ${item.title}: ${formatDeadline(item.date)} (${item.daysRemaining === 0 ? "today" : `${item.daysRemaining} day${item.daysRemaining === 1 ? "" : "s"} left`})`)
          .join("\n")}\n\n${CONFIRM_NOTE}`,
        cards: soon.flatMap((item) => (byId.get(item.id) ? [toCard(byId.get(item.id) as Opportunity)] : [])),
        links: [{ label: "See all deadlines", href: "/deadlines" }],
      });
    }

    default: {
      // search_opportunities | explain_opportunity | compare | eligibility
      const found = await findMatches(message, tools, now, {
        excludePassed: intent === "search_opportunities" || intent === "compare",
      });
      if (!found.ok) return unavailable(intent);

      const { items, entities } = found;

      if (items.length === 0) {
        return reply({
          intent,
          text: "I couldn’t find published opportunities matching that. Try a broader search, a different type, or another country.",
          links: [{ label: "Browse all opportunities", href: "/opportunities" }],
          suggestions: HELP_SUGGESTIONS,
        });
      }

      if (intent === "compare") {
        if (items.length < 2) {
          return reply({
            intent,
            text: "I need at least two matching opportunities to compare. Try naming two or describing a group, such as “compare fully funded scholarships”.",
            cards: items.map(toCard),
          });
        }
        const picked = items.slice(0, 4);
        return reply({
          intent,
          text: `I can compare ${picked.length} matching opportunities side by side: funding, eligibility, deadlines and requirements.`,
          cards: picked.map(toCard),
          links: [{ label: "Open comparison", href: `/compare?ids=${picked.map((item) => item.id).join(",")}` }],
        });
      }

      if (intent === "explain_opportunity" || intent === "eligibility") {
        const best = items[0];
        const header = `${best.title}, ${best.organization} (${typeLabel(best.type)}${best.country ? `, ${best.country}` : ""})`;
        const facts = [
          `Funding: ${fundingTypeLabel[best.fundingType]}`,
          `Deadline: ${best.deadline ? formatDeadline(best.deadline) : "none listed"}${(daysUntil(best.deadline, now) ?? 0) < 0 ? " (this deadline has passed)" : ""}`,
        ].join("\n");

        const body =
          intent === "eligibility"
            ? [
                "I can show what this opportunity asks for, but I can’t check it against your profile yet, so I won’t say whether you’re eligible. Each item below is marked as not checked.",
                bullets("Eligibility", best.eligibility.map((e) => `${e} (not checked)`)),
                bullets("Academic requirements", best.academicRequirements.map((e) => `${e} (not checked)`)),
                bullets("Skills", best.skillsRequirements.map((e) => `${e} (not checked)`)),
                bullets("Required documents", best.requiredDocuments),
              ]
            : [
                best.summary || "",
                bullets("Eligibility", best.eligibility),
                bullets("Required documents", best.requiredDocuments),
              ];

        const others = items.slice(1, MAX_CARDS);
        return reply({
          intent,
          text: [header, facts, ...body, CONFIRM_NOTE].filter(Boolean).join("\n\n"),
          cards: [toCard(best), ...others.map(toCard)],
          links: officialLinks(best),
          suggestions: ["Compare these", "Show deadlines closing soon"],
        });
      }

      const filters = describeFilters(entities);
      return reply({
        intent,
        text: `I found ${items.length} published ${items.length === 1 ? "opportunity" : "opportunities"}${filters ? ` ${filters}` : ""}. Here ${items.length > MAX_CARDS ? `are the first ${MAX_CARDS}` : items.length === 1 ? "it is" : "they are"}. ${CONFIRM_NOTE}`,
        cards: items.slice(0, MAX_CARDS).map(toCard),
        links: [
          { label: "Browse all opportunities", href: "/opportunities" },
          ...(items.length >= 2
            ? [{ label: "Compare the top results", href: `/compare?ids=${items.slice(0, 4).map((item) => item.id).join(",")}` }]
            : []),
        ],
        suggestions: ["Show deadlines closing soon", "Explain the first one"],
      });
    }
  }
}
