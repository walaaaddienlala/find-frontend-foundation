import Link from 'next/link'

import { buttonVariants } from '@/components/ui/button'
import { Logo } from '@/components/brand/logo'
import { Container } from '@/components/layout/page-container'
import { MobileNav } from '@/components/layout/mobile-nav'
import { NavLinks } from '@/components/layout/nav-links'
import { authNav, mainNav } from '@/lib/site-config'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/80">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <Container className="flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Main" className="hidden md:block">
          <NavLinks items={mainNav} />
        </nav>

        <div className="hidden items-center gap-2 md:flex">
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
        </div>

        <div className="md:hidden">
          <MobileNav />
        </div>
      </Container>
    </header>
  )
}
