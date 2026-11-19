import type { FundingType, OpportunityType } from "../types";
import type { Entities, Intent } from "./types";

/**
 * Deterministic intent + entity detection. IMPLEMENTED. Rule-based on purpose:
 * it is explainable, free, testable and cannot hallucinate. An LLM-based
 * classifier can replace it behind the same signature once a provider is configured.
 */
const TYPE_PATTERNS: Array<[RegExp, OpportunityType]> = [
  [/\bscholarships?\b/i, "scholarship"],
  [/\binternships?\b/i, "internship"],
  [/\bfellowships?\b/i, "fellowship"],
  [/\b(graduate programs?|masters?|phd|postgraduate)\b/i, "graduate-program"],
  [/\bcompetitions?|hackathons?\b/i, "competition"],
  [/\bvolunteer(ing)?\b/i, "volunteering"],
  [/\bconferences?\b/i, "conference"],
  [/\bworkshops?\b/i, "workshop"],
];

const STOP_WORDS = new Set(
  "a an the and or of for to in on at by with from about any some me my i you can could would please show find search list give tell what whats is are there opportunity opportunities program programs that which looking want need new latest fully partially funded closing deadline deadlines compare explain details detail eligible eligibility apply".split(" "),
);

export function detectEntities(message: string, knownCountries: readonly string[] = []): Entities {
  const types = TYPE_PATTERNS.filter(([pattern]) => pattern.test(message)).map(([, type]) => type);

  const country =
    [...knownCountries]
      .sort((a, b) => b.length - a.length)
      .find((candidate) => candidate && new RegExp(`\\b${escapeRegExp(candidate)}\\b`, "i").test(message)) ?? null;

  let funding: FundingType | null = null;
  if (/\bfully[\s-]?funded\b/i.test(message)) funding = "fully_funded";
  else if (/\bpartially[\s-]?funded\b/i.test(message)) funding = "partially_funded";

  const consumed = [
    ...TYPE_PATTERNS.map(([pattern]) => pattern),
    ...(country ? [new RegExp(`\\b${escapeRegExp(country)}\\b`, "i")] : []),
  ];
  let remaining = message;
  for (const pattern of consumed) remaining = remaining.replace(pattern, " ");

  const query = remaining
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word))
    .slice(0, 6)
    .join(" ");

  return { types, country, funding, query };
}

export function detectIntent(message: string): Intent {
  const text = message.trim();

  if (text.length < 2) return "unknown";
  if (/\b(human|real person|support team|customer support|talk to (a |an )?(person|agent|someone))\b/i.test(text)) return "human_support";
  if (/\bmy (applications?|status|deadlines?)\b|application status|track my/i.test(text)) return "my_applications";
  if (/\bcompare\b|\bversus\b|\bvs\.?\b/i.test(text)) return "compare";
  if (/\b(eligib\w*|can i apply|do i qualify|qualif\w*|am i (able|ready))\b/i.test(text)) return "eligibility";
  if (/\b(deadlines?|closing soon|closes?|due soon)\b/i.test(text)) return "deadlines";
  if (/\b(tell me about|explain|details? (on|about|of)|what is|what's)\b/i.test(text)) return "explain_opportunity";
  if (/^(hi|hello|hey|salam|good (morning|afternoon|evening))\b/i.test(text) && text.split(/\s+/).length <= 4) return "greeting";
  if (/\b(what can you do|help)\b/i.test(text) && text.split(/\s+/).length <= 6) return "help";

  return "search_opportunities";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
