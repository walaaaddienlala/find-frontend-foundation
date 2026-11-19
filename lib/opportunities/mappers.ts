import {
  opportunityTypes,
  type FundingType,
  type OpportunityType,
  type WorkMode,
} from "../types";

/**
 * Pure normalizers between database values and UI model values.
 * IMPLEMENTED (core hardening). Replaces the earlier behaviour where any type
 * the UI did not know (volunteering, conference, workshop, other) was silently
 * shown as "fellowship" and an unspecified delivery mode was shown as "on-site".
 */
export function normalizeOpportunityType(
  value: string | null | undefined,
): OpportunityType {
  const normalized = (value ?? "").toLowerCase().trim().replace(/[_\s]+/g, "-");

  return (opportunityTypes as readonly string[]).includes(normalized)
    ? (normalized as OpportunityType)
    : "other";
}

/** Inverse of normalizeOpportunityType for database filters (graduate-program -> graduate_program). */
export function toDatabaseOpportunityType(value: OpportunityType): string {
  return value.replace(/-/g, "_");
}

export function normalizeWorkMode(value: string | null | undefined): WorkMode {
  switch ((value ?? "").toLowerCase().trim()) {
    case "remote":
      return "remote";
    case "hybrid":
      return "hybrid";
    case "in_person":
    case "in-person":
    case "on-site":
    case "onsite":
      return "on-site";
    default:
      return "unspecified";
  }
}

const fundingTypes: readonly FundingType[] = [
  "fully_funded",
  "partially_funded",
  "unfunded",
  "no_fee",
  "unspecified",
];

export function normalizeFundingType(
  value: string | null | undefined,
): FundingType {
  return (fundingTypes as readonly string[]).includes(value ?? "")
    ? (value as FundingType)
    : "unspecified";
}
