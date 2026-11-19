/**
 * Returns a normalized absolute http(s) URL, or null if the value is not one.
 *
 * `new URL()` alone accepts dangerous schemes such as `javascript:` or
 * `data:`. Anything an admin stores as an application/source link is later
 * rendered as an <a href>, so only http(s) without embedded credentials is
 * accepted server-side. Do not rely on render-time checks alone.
 */
export function normalizeHttpUrl(value: string | null | undefined): string | null {
  const trimmed = typeof value === "string" ? value.trim() : "";

  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    if (parsed.username || parsed.password) return null;
    if (!parsed.hostname) return null;

    return parsed.toString();
  } catch {
    return null;
  }
}
