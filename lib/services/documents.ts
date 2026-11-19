import type { ApplicationDocument, UploadRequest, VaultDocument } from "@/lib/models/document";
import { unimplemented } from "@/lib/services/guard";
import type { ServiceResult } from "@/lib/services/result";

/**
 * SCAFFOLDED. TODO(documents): implement after migration 004 and bucket creation.
 * Always validate with lib/documents/policy.ts first; return only short-lived
 * signed URLs (SIGNED_URL_TTL_SECONDS); never log file contents.
 */
export interface DocumentService {
  listDocuments(): Promise<ServiceResult<VaultDocument[]>>;
  requestUpload(request: UploadRequest): Promise<ServiceResult<{ documentId: string; uploadUrl: string }>>;
  getSignedUrl(documentId: string): Promise<ServiceResult<{ url: string; expiresInSeconds: number }>>;
  replaceDocument(documentId: string, request: UploadRequest): Promise<ServiceResult<VaultDocument>>;
  deleteDocument(documentId: string): Promise<ServiceResult<null>>;
  approveForApplication(documentId: string, applicationId: string): Promise<ServiceResult<ApplicationDocument>>;
}

export const documentService: DocumentService = {
  listDocuments: () => unimplemented("Document vault"),
  requestUpload: () => unimplemented("Document vault"),
  getSignedUrl: () => unimplemented("Document vault"),
  replaceDocument: () => unimplemented("Document vault"),
  deleteDocument: () => unimplemented("Document vault"),
  approveForApplication: () => unimplemented("Document vault"),
};
