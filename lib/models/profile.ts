/** PROPOSED model for migration 002_profiles.sql. Nothing here is verified against the live database. */
export const profileVisibilities = ["private", "members", "public"] as const;
export type ProfileVisibility = (typeof profileVisibilities)[number];

export const profileEntryKinds = [
  "work", "internship", "volunteering", "leadership", "project",
  "research", "publication", "certification", "competition", "activity",
] as const;
export type ProfileEntryKind = (typeof profileEntryKinds)[number];

export type Profile = {
  userId: string;
  fullName: string | null;
  nationality: string | null;
  countryOfResidence: string | null;
  dateOfBirth: string | null; // sensitive: never in public views
  phone: string | null; // sensitive: never in public views
  languages: string[];
  university: string | null;
  faculty: string | null;
  major: string | null;
  academicLevel: string | null;
  graduationYear: number | null;
  gpa: number | null;
  interests: string[];
  skills: string[];
  careerGoals: string | null;
  visibility: ProfileVisibility;
  preferences: ProfilePreferences;
  createdAt: string;
  updatedAt: string;
};

export type ProfilePreferences = {
  targetCountries: string[];
  opportunityTypes: string[];
  fundingTypes: string[];
  workModes: string[];
};

export type ProfileEntry = {
  id: string;
  userId: string;
  kind: ProfileEntryKind;
  title: string;
  organization: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  url: string | null;
};

/** Writable subset. Fields the user did not provide stay null; never inferred. */
export type ProfileInput = Partial<
  Omit<Profile, "userId" | "createdAt" | "updatedAt">
>;
export type ProfileEntryInput = Omit<ProfileEntry, "id" | "userId">;
