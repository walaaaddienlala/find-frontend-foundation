/**
 * Makes free text safe to embed in a PostgREST `.or()` / `ilike` filter string.
 * PostgREST treats , ( ) as filter syntax and % * as wildcards, so a raw user
 * query could otherwise change the meaning of the filter.
 * IMPLEMENTED (core hardening: pagination/search).
 */
export function sanitizeSearchTerm(raw: string | null | undefined): string {
  return (raw ?? "")
    .replace(/[,()%*\\"'`:;]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

export function clampPage(value: unknown, fallback = 1): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.min(Math.floor(parsed), 10_000) : fallback;
}

export function clampPageSize(value: unknown, fallback = 12, max = 50): number {
  const parsed = typeof value === "string" ? Number.parseInt(value, 10) : Number(value);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.min(Math.floor(parsed), max) : fallback;
}
