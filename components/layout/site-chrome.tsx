'use client'

import { usePathname } from 'next/navigation'

import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

export function SiteChrome({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return (
      <main id="main-content" className="min-h-dvh">
        {children}
      </main>
    )
  }

  return (
    <>
      <SiteHeader />

      <main id="main-content" className="flex-1">
        {children}
      </main>

      <SiteFooter />
    </>
  )
}