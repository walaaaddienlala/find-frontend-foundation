import { createServerClient } from '@supabase/ssr'

import { getSupabaseEnv, MISSING_SUPABASE_ENV_MESSAGE } from '@/lib/env'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const env = getSupabaseEnv()

  if (!env) {
    throw new Error(MISSING_SUPABASE_ENV_MESSAGE)
  }

  return createServerClient(env.url, env.publishableKey, {
    global: {
      fetch: (url, options = {}) => {
        const headers = new Headers(options.headers)

        headers.set('Cache-Control', 'no-cache, no-store')
        headers.set('Pragma', 'no-cache')

        return fetch(url, {
          ...options,
          headers,
          cache: 'no-store',
        })
      },
    },

    cookies: {
      getAll() {
        return cookieStore.getAll()
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Cookie updates may need to be handled by proxy.ts.
        }
      },
    },
  })
}