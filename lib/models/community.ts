/** PROPOSED models for migration 007_community_mentors.sql. */
export const communityKinds = ["interest", "goal", "opportunity", "career", "university"] as const;
export type CommunityKind = (typeof communityKinds)[number];

export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  kind: CommunityKind;
  visibility: "public" | "members";
  status: "active" | "archived";
};
export type CommunityMember = { communityId: string; userId: string; role: "member" | "moderator" };
export type ModerationStatus = "visible" | "hidden" | "removed";
export type Post = { id: string; communityId: string; authorId: string; title: string; body: string; status: ModerationStatus; createdAt: string };
export type Comment = { id: string; postId: string; authorId: string; body: string; status: ModerationStatus; createdAt: string };
export type ContentReport = {
  id: string;
  reporterId: string;
  targetType: "post" | "comment";
  targetId: string;
  reason: string;
  status: "open" | "reviewed" | "actioned" | "dismissed";
};

export type MentorProfile = {
  id: string;
  userId: string;
  headline: string;
  bio: string;
  fields: string[];
  languages: string[];
  /** Public listing requires "verified". */
  status: "pending" | "verified" | "suspended";
};
export type MentorSession = {
  id: string;
  mentorId: string;
  menteeId: string;
  startsAt: string;
  endsAt: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
};

export type SuccessStory = {
  id: string;
  authorId: string;
  title: string;
  body: string;
  opportunityId: string | null;
  status: "draft" | "pending_review" | "published" | "rejected";
  /** Consent and evidence are recorded; stories are never fabricated. */
  consentedAt: string | null;
};
