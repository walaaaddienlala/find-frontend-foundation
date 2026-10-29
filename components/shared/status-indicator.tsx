import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { applicationStatusMeta, readinessMeta } from '@/lib/status'
import type { ApplicationStatus, ReadinessLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

const dotColor: Record<BadgeVariant, string> = {
  default: 'bg-primary',
  secondary: 'bg-primary',
  cta: 'bg-cta',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  destructive: 'bg-destructive',
  neutral: 'bg-muted-foreground',
  outline: 'bg-muted-foreground',
}

type StatusBadgeProps = {
  label: string
  variant: BadgeVariant
  className?: string
}

/** Badge with a leading status dot. Color is never the only signal: the label is always shown. */
export function StatusBadge({ label, variant, className }: StatusBadgeProps) {
  return (
    <Badge variant={variant} className={className}>
      <span
        aria-hidden="true"
        className={cn('size-1.5 rounded-full', dotColor[variant])}
      />
      {label}
    </Badge>
  )
}

export function ApplicationStatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus
  className?: string
}) {
  const meta = applicationStatusMeta[status]
  return <StatusBadge label={meta.label} variant={meta.variant} className={className} />
}

export function ReadinessBadge({
  level,
  className,
}: {
  level: ReadinessLevel
  className?: string
}) {
  const meta = readinessMeta[level]
  return <StatusBadge label={meta.label} variant={meta.variant} className={className} />
}
