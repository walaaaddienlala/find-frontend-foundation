import type { Opportunity } from "../types";

/**
 * Opportunity comparison logic. IMPLEMENTED (works on existing published data).
 * Pure so it is unit-tested without a browser or database.
 */
export const COMPARE_MIN = 2;
export const COMPARE_MAX = 4;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Accepts `a,b`, repeated `?ids=a&ids=b`, or an array. Dedupes, validates UUIDs, caps at COMPARE_MAX. */
export function parseCompareIds(
  raw: string | string[] | undefined | null,
): { ids: string[]; truncated: boolean; invalidCount: number } {
  const parts = (Array.isArray(raw) ? raw : [raw ?? ""])
    .flatMap((value) => value.split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  const unique = Array.from(new Set(parts.map((value) => value.toLowerCase())));
  const valid = unique.filter((value) => UUID_PATTERN.test(value));

  return {
    ids: valid.slice(0, COMPARE_MAX),
    truncated: valid.length > COMPARE_MAX,
    invalidCount: unique.length - valid.length,
  };
}

export type ComparisonFormatters = {
  type: (value: Opportunity["type"]) => string;
  workMode: (value: Opportunity["workMode"]) => string;
  funding: (value: Opportunity["fundingType"]) => string;
  date: (value: string) => string;
};

export type ComparisonRow = {
  key: string;
  label: string;
  /** One entry per compared opportunity; list rows are arrays. */
  values: Array<string | string[]>;
  /** true when the opportunities differ on this row (used to highlight it). */
  differs: boolean;
  note?: string;
};

function row(
  key: string,
  label: string,
  values: Array<string | string[]>,
  note?: string,
): ComparisonRow {
  const serialized = values.map((value) =>
    Array.isArray(value) ? [...value].sort().join("|") : value,
  );

  return {
    key,
    label,
    values,
    differs: new Set(serialized).size > 1,
    note,
  };
}

export function buildComparisonRows(
  opportunities: Opportunity[],
  format: ComparisonFormatters,
): ComparisonRow[] {
  const text = (value: string) => value.trim() || "Not specified";

  return [
    row("organization", "Organization", opportunities.map((o) => text(o.organization))),
    row("type", "Type", opportunities.map((o) => format.type(o.type))),
    row("country", "Country", opportunities.map((o) => text(o.country))),
    row("location", "Location", opportunities.map((o) => text(o.location))),
    row("workMode", "Delivery", opportunities.map((o) => format.workMode(o.workMode))),
    row("funding", "Funding", opportunities.map((o) => format.funding(o.fundingType))),
    row("deadline", "Deadline", opportunities.map((o) => (o.deadline ? format.date(o.deadline) : "Not specified"))),
    row("programStart", "Program starts", opportunities.map((o) => (o.programStartDate ? format.date(o.programStartDate) : "Not specified"))),
    row("programEnd", "Program ends", opportunities.map((o) => (o.programEndDate ? format.date(o.programEndDate) : "Not specified"))),
    row("eligibility", "Eligibility", opportunities.map((o) => o.eligibility)),
    row("requirements", "Requirements", opportunities.map((o) => o.requirements)),
    row("academic", "Academic requirements", opportunities.map((o) => o.academicRequirements)),
    row("skills", "Skills", opportunities.map((o) => o.skillsRequirements)),
    row("documents", "Required documents", opportunities.map((o) => o.requiredDocuments)),
    row(
      "preparationItems",
      "Listed preparation items",
      opportunities.map((o) => String(o.requirements.length + o.requiredDocuments.length)),
      "Count of listed requirements and documents. This is not a difficulty rating.",
    ),
  ];
}
