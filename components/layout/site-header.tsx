'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bookmark, LogOut } from 'lucide-react'

import { isSupabaseConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/client'
import { buttonVariants } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'
import { Container } from '@/components/layout/page-container'
import { EcosystemMenu } from '@/components/layout/ecosystem-menu'
import { MobileNav } from '@/components/layout/mobile-nav'
import { NavLinks } from '@/components/layout/nav-links'
import { authNav, mainNav } from '@/lib/site-config'

export function SiteHeader() {
  const router = useRouter()
  const supabase = useMemo(
    () => (isSupabaseConfigured() ? createClient() : null),
    [],
  )
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

useEffect(() => {
  if (!supabase) return

  let mounted = true

  supabase.auth.getUser().then(({ data: { user } }) => {
    if (mounted) {
      setIsSignedIn(Boolean(user))
    }
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    if (mounted) {
      setIsSignedIn(Boolean(session?.user))
    }
  })

  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [supabase])

  async function handleSignOut() {
    if (!supabase) return

    setIsSigningOut(true)

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out failed:', error)
      setIsSigningOut(false)
      return
    }

    setIsSignedIn(false)
    router.replace('/sign-in')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/80">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50"
      >
        Skip to content
      </a>

      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          <EcosystemMenu />
          <nav aria-label="Main">
            <NavLinks items={mainNav} />
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/saved"
            className={buttonVariants({ variant: 'ghost' })}
          >
            <Bookmark className="size-4" aria-hidden="true" />
            Saved
          </Link>

          {isSignedIn ? (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className={buttonVariants({ variant: 'ghost' })}
            >
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              {isSigningOut ? 'Signing out…' : 'Sign Out'}
            </button>
          ) : (
            <>
              <Link
                href={authNav.signIn.href}
                className={buttonVariants({ variant: 'ghost' })}
              >
                {authNav.signIn.label}
              </Link>

              <Link
                href={authNav.getStarted.href}
                className={buttonVariants({ variant: 'cta' })}
              >
                {authNav.getStarted.label}
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/saved"
            aria-label="Saved opportunities"
            className={buttonVariants({ variant: 'ghost', size: 'icon' })}
          >
            <Bookmark className="size-5" aria-hidden="true" />
          </Link>

          <MobileNav />
        </div>
      </Container>
    </header>
  )
}