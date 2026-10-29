import type { BadgeVariant } from '@/components/ui/badge'
import type {
  ApplicationStatus,
  OpportunityType,
  ReadinessLevel,
  WorkMode,
} from '@/lib/types'

type StatusMeta = { label: string; variant: BadgeVariant }

export const applicationStatusMeta: Record<ApplicationStatus, StatusMeta> = {
  saved: { label: 'Saved', variant: 'neutral' },
  preparing: { label: 'Preparing', variant: 'warning' },
  submitted: { label: 'Submitted', variant: 'info' },
  interview: { label: 'Interview', variant: 'cta' },
  offer: { label: 'Offer', variant: 'success' },
  closed: { label: 'Closed', variant: 'destructive' },
}

export const readinessMeta: Record<ReadinessLevel, StatusMeta> = {
  ready: { label: 'Ready to apply', variant: 'success' },
  almost: { label: 'Almost ready', variant: 'warning' },
  building: { label: 'Building skills', variant: 'cta' },
  'not-assessed': { label: 'Not assessed', variant: 'neutral' },
}

export const opportunityTypeLabel: Record<OpportunityType, string> = {
  internship: 'Internship',
  scholarship: 'Scholarship',
  fellowship: 'Fellowship',
  'graduate-program': 'Graduate program',
  competition: 'Competition',
}

export const workModeLabel: Record<WorkMode, string> = {
  remote: 'Remote',
  hybrid: 'Hybrid',
  'on-site': 'On-site',
}
