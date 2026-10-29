'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/site-config'

export function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

type NavLinksProps = {
  items: NavItem[]
  orientation?: 'horizontal' | 'vertical'
  onNavigate?: () => void
}

export function NavLinks({
  items,
  orientation = 'horizontal',
  onNavigate,
}: NavLinksProps) {
  const pathname = usePathname()

  return (
    <ul
      className={cn(
        'flex',
        orientation === 'horizontal'
          ? 'items-center gap-1'
          : 'flex-col gap-1',
      )}
    >
      {items.map((item) => {
        const active = isActivePath(pathname, item.href)
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center rounded-lg font-medium transition-colors',
                orientation === 'horizontal'
                  ? 'h-10 px-3 text-sm'
                  : 'h-12 px-3 text-base',
                active
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {item.label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
