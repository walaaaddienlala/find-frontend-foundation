/**
 * Deterministic dedupe key so the same event never notifies a user twice.
 * Paired with the proposed unique (user_id, dedupe_key) constraint.
 * IMPLEMENTED (pure, tested). `window` scopes repeats, e.g. a date for
 * daily deadline reminders, so "3 days left" and "1 day left" are distinct.
 */
export function buildDedupeKey(parts: {
  category: string;
  entityType?: string | null;
  entityId?: string | null;
  window?: string | null;
}): string {
  const clean = (value: string | null | undefined, fallback: string) =>
    (value ?? "").toLowerCase().trim().replace(/[^a-z0-9_.-]+/g, "-").slice(0, 80) || fallback;

  return [
    clean(parts.category, "general"),
    clean(parts.entityType, "-"),
    clean(parts.entityId, "-"),
    clean(parts.window, "once"),
  ].join(":");
}
