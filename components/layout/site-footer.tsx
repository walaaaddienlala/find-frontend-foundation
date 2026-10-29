import Link from 'next/link'

import { Logo } from '@/components/brand/logo'
import { Container } from '@/components/layout/page-container'
import { footerNav, siteConfig } from '@/lib/site-config'

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex max-w-xs flex-col gap-3">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteConfig.tagline} Discover opportunities and prepare with
              confidence.
            </p>
          </div>

          {footerNav.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="font-heading text-sm font-semibold text-foreground">
                {group.title}
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights
            reserved.
          </p>
          <p>Early preview &middot; features are still in development.</p>
        </div>
      </Container>
    </footer>
  )
}
