/**
 * Scaffold pages are not functional. They render only outside production, or
 * in production/preview when NEXT_PUBLIC_ENABLE_SCAFFOLD_PAGES=true, so real
 * users never land on a half-built feature. Implemented features are always visible.
 */
export function areScaffoldsVisible(): boolean {
  return (
    process.env.NODE_ENV !== "production" ||
    process.env.NEXT_PUBLIC_ENABLE_SCAFFOLD_PAGES === "true"
  );
}
