import type {
  Community, ContentReport, MentorProfile, MentorSession, Post, SuccessStory,
} from "@/lib/models/community";
import { unimplemented } from "@/lib/services/guard";
import type { ServiceResult } from "@/lib/services/result";

/**
 * SCAFFOLDED. TODO(community): implement after migration 007. Moderation
 * (reports, hidden/removed content) must exist before posting is opened.
 */
export interface CommunityService {
  listCommunities(): Promise<ServiceResult<Community[]>>;
  join(communityId: string): Promise<ServiceResult<null>>;
  createPost(input: { communityId: string; title: string; body: string }): Promise<ServiceResult<Post>>;
  reportContent(input: Pick<ContentReport, "targetType" | "targetId" | "reason">): Promise<ServiceResult<ContentReport>>;
}

/** Only mentors with status "verified" may be listed publicly. */
export interface MentorService {
  listVerifiedMentors(opts?: { field?: string; language?: string }): Promise<ServiceResult<MentorProfile[]>>;
  requestSession(input: { mentorId: string; startsAt: string; endsAt: string }): Promise<ServiceResult<MentorSession>>;
  listMySessions(): Promise<ServiceResult<MentorSession[]>>;
}

/** Stories are reviewed before publication and never fabricated. */
export interface SuccessStoryService {
  listPublishedStories(opts?: { opportunityId?: string }): Promise<ServiceResult<SuccessStory[]>>;
  submitStory(input: Pick<SuccessStory, "title" | "body" | "opportunityId">): Promise<ServiceResult<SuccessStory>>;
}

export const communityService: CommunityService = {
  listCommunities: () => unimplemented("Community"),
  join: () => unimplemented("Community"),
  createPost: () => unimplemented("Community"),
  reportContent: () => unimplemented("Community"),
};

export const mentorService: MentorService = {
  listVerifiedMentors: () => unimplemented("Mentors"),
  requestSession: () => unimplemented("Mentors"),
  listMySessions: () => unimplemented("Mentors"),
};

export const successStoryService: SuccessStoryService = {
  listPublishedStories: () => unimplemented("Success stories"),
  submitStory: () => unimplemented("Success stories"),
};
