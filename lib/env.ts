/**
 * Central, side-effect-free environment access.
 *
 * IMPLEMENTED (core hardening). Callers use `isSupabaseConfigured()` to degrade
 * gracefully (empty state / error state) instead of crashing a whole render when
 * variables are missing. NEXT_PUBLIC_* variables must be referenced statically
 * so Next.js can inline them into the browser bundle.
 */
export type SupabaseEnv = { url: string; publishableKey: string }

export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !publishableKey) return null

  return { url, publishableKey }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null
}

export const MISSING_SUPABASE_ENV_MESSAGE =
  "Missing Supabase environment variables. Check your .env.local file."
