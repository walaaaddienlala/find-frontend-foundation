import type { AiAuditEvent } from "../models/ai";

/**
 * Audit trail interface for every AI call. The sink implementation is PENDING
 * (needs migration 005). `redactForAudit` is implemented and tested.
 */
export interface AuditSink {
  record(event: Omit<AiAuditEvent, "id" | "createdAt">): Promise<void>;
}

/** Masks emails and long digit runs, then truncates, so audit rows hold no raw personal content. */
export function redactForAudit(text: string, maxLength = 200): string {
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\d[\d\s-]{6,}\d/g, "[number]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}
