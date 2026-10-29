import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, type LucideIcon } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from '@/components/ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'

type LoadingStateProps = {
  label?: string
  variant?: 'spinner' | 'cards'
  count?: number
  className?: string
}

/** Announces loading to assistive tech and shows either a spinner or card skeletons. */
export function LoadingState({
  label = 'Loading',
  variant = 'spinner',
  count = 3,
  className,
}: LoadingStateProps) {
  if (variant === 'cards') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}
      >
        <span className="sr-only">{label}</span>
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            aria-hidden="true"
            className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground',
        className,
      )}
    >
      <Spinner className="size-6 text-primary" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

type MessageStateProps = {
  title: string
  description?: ReactNode
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: MessageStateProps) {
  return (
    <Empty
      className={cn('border border-border-strong bg-card py-12', className)}
    >
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-12 rounded-xl bg-secondary text-secondary-foreground"
        >
          <Icon className="size-6" aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle className="font-heading text-lg font-semibold">
          {title}
        </EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {action ? <EmptyContent>{action}</EmptyContent> : null}
    </Empty>
  )
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this content. Please try again.',
  icon: Icon = AlertTriangle,
  action,
  className,
}: Partial<MessageStateProps>) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-4 rounded-xl border border-destructive/25 bg-destructive-soft px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-xl bg-card text-destructive-soft-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="flex max-w-sm flex-col gap-1">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}
