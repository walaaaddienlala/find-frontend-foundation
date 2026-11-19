/** Returns a same-origin relative path, or the supplied fallback. */
export function getSafeReturnTo(
  candidate: string | null | undefined,
  origin: string,
  fallback = '/opportunities',
): string {
  if (
    !candidate ||
    !candidate.startsWith('/') ||
    candidate.startsWith('//') ||
    candidate.includes('\\') ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return fallback
  }

  try {
    const parsed = new URL(candidate, origin)
    if (parsed.origin !== new URL(origin).origin) return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
