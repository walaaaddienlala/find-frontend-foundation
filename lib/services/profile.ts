import type { Profile, ProfileEntry, ProfileEntryInput, ProfileInput } from "@/lib/models/profile";
import { unimplemented } from "@/lib/services/guard";
import type { ServiceResult } from "@/lib/services/result";

/**
 * SCAFFOLDED. TODO(profile): implement against the `profiles` / `profile_entries`
 * tables once migration 002 is approved and applied. Reads/writes must be scoped
 * to the signed-in user; never infer missing fields.
 */
export interface ProfileService {
  getMyProfile(): Promise<ServiceResult<Profile | null>>;
  saveMyProfile(input: ProfileInput): Promise<ServiceResult<Profile>>;
  listMyEntries(): Promise<ServiceResult<ProfileEntry[]>>;
  saveEntry(input: ProfileEntryInput & { id?: string }): Promise<ServiceResult<ProfileEntry>>;
  deleteEntry(id: string): Promise<ServiceResult<null>>;
  exportMyData(): Promise<ServiceResult<Record<string, unknown>>>;
}

export const profileService: ProfileService = {
  getMyProfile: () => unimplemented("Profile"),
  saveMyProfile: () => unimplemented("Profile"),
  listMyEntries: () => unimplemented("Profile"),
  saveEntry: () => unimplemented("Profile"),
  deleteEntry: () => unimplemented("Profile"),
  exportMyData: () => unimplemented("Profile export"),
};
