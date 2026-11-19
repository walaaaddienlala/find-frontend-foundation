'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, Menu } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from '@/components/brand/logo'
import { NavLinks } from '@/components/layout/nav-links'
import { authNav, mainNav } from '@/lib/site-config'
import { cn } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/env'
import { EcosystemList } from '@/components/layout/ecosystem-menu'
import { createClient } from '@/lib/supabase/client'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const router = useRouter()
  const supabase = useMemo(
    () => (isSupabaseConfigured() ? createClient() : null),
    [],
  )

  const close = () => setOpen(false)

  useEffect(() => {
    if (!supabase) return

    let mounted = true

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) setIsSignedIn(Boolean(user))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setIsSignedIn(Boolean(session?.user))
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
    close()
    router.replace('/sign-in')
    router.refresh()
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Open menu" />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="w-[85%] max-w-sm gap-0 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>
            <Logo asLink={false} />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
        </SheetHeader>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks
            items={mainNav}
            orientation="vertical"
            onNavigate={close}
          />
          <EcosystemList onNavigate={close} />
        </nav>

        <div className="flex flex-col gap-3 border-t border-border p-5">
          {isSignedIn ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              {isSigningOut ? 'Signing out…' : 'Sign Out'}
            </Button>
          ) : (
            <>
              <Link
                href={authNav.getStarted.href}
                onClick={close}
                className={cn(
                  buttonVariants({ variant: 'cta', size: 'lg' }),
                  'w-full',
                )}
              >
                {authNav.getStarted.label}
              </Link>

              <Link
                href={authNav.signIn.href}
                onClick={close}
                className={cn(
                  buttonVariants({ variant: 'outline', size: 'lg' }),
                  'w-full',
                )}
              >
                {authNav.signIn.label}
              </Link>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}