import Link from 'next/link'
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatDeadline } from '@/lib/format'
import { opportunityTypeLabel, workModeLabel } from '@/lib/status'
import type { Opportunity } from '@/lib/types'

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  return (
    <Card className="relative h-full transition-colors focus-within:border-primary hover:border-border-strong">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{opportunityTypeLabel[opportunity.type]}</Badge>
          <Badge variant="outline">{workModeLabel[opportunity.workMode]}</Badge>
        </div>
        <div className="flex flex-col gap-1">
          <CardTitle>
            <Link
              href={`/opportunities/${opportunity.id}`}
              className="rounded-sm after:absolute after:inset-0 focus-visible:outline-none"
            >
              {opportunity.title}
            </Link>
          </CardTitle>
          <CardDescription>{opportunity.organization}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {opportunity.summary}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="size-4" aria-hidden="true" />
            {opportunity.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" aria-hidden="true" />
            <span className="sr-only">Deadline:</span>
            {formatDeadline(opportunity.deadline)}
          </span>
        </div>
        <ArrowRight className="size-4 text-primary" aria-hidden="true" />
      </CardFooter>
    </Card>
  )
}
