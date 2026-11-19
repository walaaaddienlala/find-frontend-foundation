import { createBrowserClient } from '@supabase/ssr'

import { getSupabaseEnv, MISSING_SUPABASE_ENV_MESSAGE } from '@/lib/env'

export function createClient() {
  const env = getSupabaseEnv()

  if (!env) {
    throw new Error(MISSING_SUPABASE_ENV_MESSAGE)
  }

  return createBrowserClient(env.url, env.publishableKey)
}