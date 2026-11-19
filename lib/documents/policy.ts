import { documentCategories, type UploadRequest } from "../models/document";

/**
 * Upload policy for the document vault. IMPLEMENTED as pure validation only:
 * nothing is stored or uploaded. Storage, signed URLs and scanning are
 * SCAFFOLDED/BLOCKED (see feature registry). Files are never publicly addressable.
 */
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const SIGNED_URL_TTL_SECONDS = 300;
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type UploadValidation = { ok: true } | { ok: false; errors: string[] };

export function validateUploadRequest(request: UploadRequest): UploadValidation {
  const errors: string[] = [];

  if (!(documentCategories as readonly string[]).includes(request.category)) {
    errors.push("Unknown document category.");
  }
  if (!request.title.trim()) errors.push("Title is required.");
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(request.mimeType)) {
    errors.push("File type is not allowed.");
  }
  if (!Number.isFinite(request.sizeBytes) || request.sizeBytes <= 0) {
    errors.push("File is empty.");
  } else if (request.sizeBytes > MAX_DOCUMENT_BYTES) {
    errors.push("File is larger than 10 MB.");
  }
  if (sanitizeFilename(request.filename) === null) {
    errors.push("File name is not valid.");
  }
  if (request.expiresOn && !/^\d{4}-\d{2}-\d{2}$/.test(request.expiresOn)) {
    errors.push("Expiry date must be YYYY-MM-DD.");
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export function sanitizeFilename(filename: string): string | null {
  const base = filename.split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(-100);

  return cleaned.length > 0 && /[a-zA-Z0-9]/.test(cleaned) ? cleaned : null;
}

const SAFE_ID = /^[a-zA-Z0-9-]{8,64}$/;

/** `{userId}/{documentId}/v{version}-{filename}`; the first segment is what storage RLS checks. */
export function buildStoragePath(
  userId: string,
  documentId: string,
  version: number,
  filename: string,
): string | null {
  const safeName = sanitizeFilename(filename);

  if (!safeName || !SAFE_ID.test(userId) || !SAFE_ID.test(documentId)) return null;
  if (!Number.isInteger(version) || version < 1) return null;

  return `${userId}/${documentId}/v${version}-${safeName}`;
}
