import Link from 'next/link'
import { Search } from 'lucide-react'

import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  /** Render as a link to the homepage. */
  asLink?: boolean
}

/**
 * Interim Find mark: no official logo asset exists in the project yet.
 * Swap the contents of LogoMark for the official asset when it is available.
 */
function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground',
        className,
      )}
    >
      <Search className="size-4.5" strokeWidth={2.5} />
      <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background bg-cta" />
    </span>
  )
}

export function Logo({ className, asLink = true }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="font-heading text-xl font-bold tracking-tight text-foreground">
        Find
      </span>
    </span>
  )

  if (!asLink) return content

  return (
    <Link href="/" aria-label="Find, go to homepage" className="rounded-lg">
      {content}
    </Link>
  )
}
