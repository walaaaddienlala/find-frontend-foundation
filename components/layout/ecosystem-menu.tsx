'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'

import { navSections, utilityNav } from '@/lib/ecosystem/navigation'

/**
 * Desktop "Explore" menu: every ecosystem section, built from the shared
 * navigation model (a test asserts each link resolves to a real page).
 * Closes on route change, Escape, and outside click.
 */
export function EcosystemMenu() {
  const ref = useRef<HTMLDetailsElement>(null)
  const pathname = usePathname()

  useEffect(() => { ref.current?.removeAttribute('open') }, [pathname])

  useEffect(() => {
    const close = (event: Event) => {
      const el = ref.current
      if (!el?.open) return
      if (event instanceof KeyboardEvent) { if (event.key === 'Escape') { el.removeAttribute('open'); el.querySelector('summary')?.focus() } }
      else if (!el.contains(event.target as Node)) el.removeAttribute('open')
    }
    document.addEventListener('keydown', close)
    document.addEventListener('mousedown', close)
    return () => { document.removeEventListener('keydown', close); document.removeEventListener('mousedown', close) }
  }, [])

  return (
    <details ref={ref} className="group">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
        Explore
        <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="fixed inset-x-0 top-16 z-40 max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-border bg-background shadow-lg">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {navSections.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="font-heading text-sm font-semibold">{section.title}</h2>
              <ul className="mt-2 flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <li key={item.href}><Link href={item.href} className="text-sm text-muted-foreground hover:text-primary">{item.label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-wrap gap-x-6 gap-y-2 px-6 py-3 text-sm">
            {utilityNav.map((item) => <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-primary">{item.label}</Link>)}
          </div>
        </div>
      </div>
    </details>
  )
}

/** Same sections as a vertical list, for the mobile sheet. */
export function EcosystemList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
      {navSections.map((section) => (
        <nav key={section.title} aria-label={section.title} className="px-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{section.title}</h2>
          <ul className="mt-1 flex flex-col">
            {section.items.map((item) => (
              <li key={item.href}><Link href={item.href} onClick={onNavigate} className="block py-2 text-sm hover:text-primary">{item.label}</Link></li>
            ))}
          </ul>
        </nav>
      ))}
      <ul className="flex flex-col px-3">
        {utilityNav.map((item) => <li key={item.href}><Link href={item.href} onClick={onNavigate} className="block py-2 text-sm text-muted-foreground hover:text-primary">{item.label}</Link></li>)}
      </ul>
    </div>
  )
}
