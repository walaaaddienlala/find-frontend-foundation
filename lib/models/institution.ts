/** PROPOSED model for migration 008_institutions.sql. */
export const institutionKinds = [
  "university", "company", "ngo", "foundation",
  "research_institution", "incubator", "training_provider",
] as const;
export type InstitutionKind = (typeof institutionKinds)[number];

export type Institution = {
  id: string;
  name: string;
  kind: InstitutionKind;
  country: string | null;
  website: string | null;
  status: "pending" | "verified" | "suspended";
};
export const institutionRoles = ["owner", "admin", "editor", "viewer"] as const;
export type InstitutionRole = (typeof institutionRoles)[number];
export type InstitutionMember = { institutionId: string; userId: string; role: InstitutionRole };
export type InstitutionInput = Pick<Institution, "name" | "kind" | "country" | "website">;
