import type { Institution, InstitutionInput, InstitutionMember, InstitutionRole } from "@/lib/models/institution";
import { unimplemented } from "@/lib/services/guard";
import type { ServiceResult } from "@/lib/services/result";

/**
 * SCAFFOLDED. TODO(institutions): implement after migrations 001 and 008. Member
 * roles are enforced by RLS, not only the UI. Opportunities created by an
 * institution still go through the verification gate.
 */
export interface InstitutionService {
  getMyInstitutions(): Promise<ServiceResult<Array<Institution & { role: InstitutionRole }>>>;
  createInstitution(input: InstitutionInput): Promise<ServiceResult<Institution>>;
  updateInstitution(id: string, input: Partial<InstitutionInput>): Promise<ServiceResult<Institution>>;
  inviteMember(input: { institutionId: string; email: string; role: InstitutionRole }): Promise<ServiceResult<InstitutionMember>>;
}

/** Admin-only. Every status change must be audit-logged. */
export interface InstitutionAdminService {
  listAll(): Promise<ServiceResult<Institution[]>>;
  setStatus(id: string, status: Institution["status"]): Promise<ServiceResult<Institution>>;
}

export const institutionService: InstitutionService = {
  getMyInstitutions: () => unimplemented("Institutions"),
  createInstitution: () => unimplemented("Institutions"),
  updateInstitution: () => unimplemented("Institutions"),
  inviteMember: () => unimplemented("Institutions"),
};

export const institutionAdminService: InstitutionAdminService = {
  listAll: () => unimplemented("Institution admin", "admin"),
  setStatus: () => unimplemented("Institution admin", "admin"),
};
