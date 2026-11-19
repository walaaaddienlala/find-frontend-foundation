/** PROPOSED model for migration 004_documents.sql. */
export const documentCategories = [
  "cv", "transcript", "certificate", "id_document", "language_certificate",
  "recommendation_letter", "motivation_letter", "portfolio", "essay", "other",
] as const;
export type DocumentCategory = (typeof documentCategories)[number];

export type VaultDocument = {
  id: string;
  userId: string;
  category: DocumentCategory;
  title: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  /** Private storage path. Never exposed; use short-lived signed URLs. */
  storagePath: string;
  status: "active" | "archived";
  expiresOn: string | null;
  currentVersion: number;
};

export type DocumentVersion = {
  id: string;
  documentId: string;
  version: number;
  sizeBytes: number;
  createdAt: string;
};

export type ApplicationDocument = {
  applicationId: string;
  documentId: string;
  /** The user approved this exact document for this application. */
  approvedAt: string | null;
};

export type UploadRequest = {
  category: DocumentCategory;
  title: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  expiresOn?: string | null;
};
