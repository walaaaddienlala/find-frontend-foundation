import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Globe2,
  Wallet,
  Clock3,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

import { SaveOpportunityButton } from '@/components/opportunities/save-opportunity-button'

import { formatDeadline } from '@/lib/format'
import {
  opportunityTypeLabel,
  workModeLabel,
} from '@/lib/status'

import type {
  Opportunity,
  FundingType,
} from '@/lib/types'

function getFundingLabel(funding: FundingType) {
  switch (funding) {
    case 'fully_funded':
      return 'Fully Funded'
    case 'partially_funded':
      return 'Partially Funded'
    case 'unfunded':
      return 'Unfunded'
    case 'no_fee':
      return 'No Fee'
    default:
      return 'Funding Not Specified'
  }
}

function getFundingVariant(
  funding: FundingType,
): 'default' | 'secondary' | 'outline' {
  switch (funding) {
    case 'fully_funded':
      return 'default'
    case 'partially_funded':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getDeadlineInfo(deadline: string) {
  if (!deadline) {
    return {
      label: 'No deadline specified',
      status: 'unknown' as const,
      remaining: '',
    }
  }

  const deadlineDate = new Date(`${deadline}T00:00:00Z`)

  if (Number.isNaN(deadlineDate.getTime())) {
    return {
      label: 'Deadline unavailable',
      status: 'unknown' as const,
      remaining: '',
    }
  }

  const now = new Date()

  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  )

  const deadlineTimestamp = deadlineDate.getTime()

  const remainingDays = Math.ceil(
    (deadlineTimestamp - today) / (1000 * 60 * 60 * 24),
  )

  if (remainingDays < 0) {
    return {
      label: 'Deadline passed',
      status: 'closed' as const,
      remaining: '',
    }
  }

  if (remainingDays === 0) {
    return {
      label: 'Deadline is today',
      status: 'closing-soon' as const,
      remaining: 'Last day to apply',
    }
  }

  if (remainingDays <= 7) {
    return {
      label: 'Closing Soon',
      status: 'closing-soon' as const,
      remaining: `${remainingDays} day${remainingDays === 1 ? '' : 's'} left`,
    }
  }

  return {
    label: 'Open',
    status: 'open' as const,
    remaining: `${remainingDays} days left`,
  }
}

function getDeadlineBadgeVariant(
  status: ReturnType<typeof getDeadlineInfo>['status'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'closed':
      return 'destructive'
    case 'closing-soon':
      return 'secondary'
    case 'open':
      return 'default'
    default:
      return 'outline'
  }
}

function getLocation(opportunity: Opportunity) {
  const parts = [
    opportunity.location,
    opportunity.country,
  ].filter(
    (value) =>
      value &&
      value !== 'Not specified' &&
      value !== 'Location not specified',
  )

  return parts.length > 0
    ? parts.join(', ')
    : 'Location not specified'
}

export function OpportunityCard({
  opportunity,
}: {
  opportunity: Opportunity
}) {
  const deadlineInfo = getDeadlineInfo(opportunity.deadline)

  return (
    <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-within:border-primary">

      <CardHeader className="gap-3">

        {/* Opportunity type and delivery mode */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">
            {opportunityTypeLabel[opportunity.type]}
          </Badge>

          <Badge variant="outline">
            {workModeLabel[opportunity.workMode]}
          </Badge>
        </div>

        {/* Title and organization */}
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-lg leading-snug">
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {opportunity.title}
            </Link>
          </CardTitle>

          <CardDescription>
            {opportunity.organization}
          </CardDescription>
        </div>

        {/* Save opportunity */}
        <div className="relative z-20">
          <SaveOpportunityButton
            opportunityId={opportunity.id}
            variant="outline"
            size="sm"
          />
        </div>

      </CardHeader>

      <CardContent className="flex-1 space-y-4">

        {/* Summary */}
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {opportunity.summary}
        </p>

        {/* Funding */}
        <div className="flex flex-wrap items-center gap-2">
          <Wallet
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />

          <Badge variant={getFundingVariant(opportunity.fundingType)}>
            {getFundingLabel(opportunity.fundingType)}
          </Badge>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="inline-flex items-start gap-2">
            <MapPin
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{getLocation(opportunity)}</span>
          </span>

          {opportunity.country &&
            opportunity.country !== 'Not specified' && (
              <span className="inline-flex items-center gap-2">
                <Globe2
                  className="size-4 shrink-0"
                  aria-hidden="true"
                />
                <span>{opportunity.country}</span>
              </span>
            )}
        </div>

        {/* Deadline */}
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays
                className="size-4"
                aria-hidden="true"
              />
              Deadline
            </span>

            <Badge variant={getDeadlineBadgeVariant(deadlineInfo.status)}>
              {deadlineInfo.label}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              {formatDeadline(opportunity.deadline)}
            </span>

            {deadlineInfo.remaining && (
              <span className="inline-flex items-center gap-1.5 font-medium text-muted-foreground">
                <Clock3
                  className="size-3.5"
                  aria-hidden="true"
                />
                {deadlineInfo.remaining}
              </span>
            )}
          </div>
        </div>

      </CardContent>

      {/* Card footer */}
      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm font-medium text-primary">
          View opportunity
        </span>

        <ArrowRight
          className="size-4 text-primary transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </CardFooter>

    </Card>
  )
}