import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, CalendarDays, CheckCircle2, FileText, MapPin } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Container, Section } from '@/components/layout/page-container'
import { Heading, Text } from '@/components/shared/typography'
import { PreviewNotice } from '@/components/shared/preview-notice'
import { ReadinessBadge } from '@/components/shared/status-indicator'
import { getOpportunities, getOpportunityById } from '@/lib/data/opportunities'
import { formatDeadline } from '@/lib/format'
import { opportunityTypeLabel, workModeLabel } from '@/lib/status'

type Props = { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  const opportunities = await getOpportunities()
  return opportunities.map((opportunity) => ({ id: opportunity.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const opportunity = await getOpportunityById(id)
  return opportunity
    ? { title: opportunity.title, description: opportunity.summary }
    : { title: 'Opportunity not found' }
}

export default async function OpportunityDetailPage({ params }: Props) {
  const { id } = await params
  const opportunity = await getOpportunityById(id)
  if (!opportunity) notFound()

  return (
    <Section className="pt-8 sm:pt-10 lg:pt-12">
      <Container className="flex flex-col gap-8">
        <Link
          href="/opportunities"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: '-ml-3 w-fit' })}
        >
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          All opportunities
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
          <article className="flex min-w-0 flex-col gap-8">
            <header className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{opportunityTypeLabel[opportunity.type]}</Badge>
                <Badge variant="outline">{workModeLabel[opportunity.workMode]}</Badge>
              </div>
              <Heading level={1}>{opportunity.title}</Heading>
              <Text variant="lead">{opportunity.organization}</Text>
              <Text>{opportunity.description}</Text>
            </header>

            <section aria-labelledby="eligibility-heading" className="flex flex-col gap-3">
              <Heading level={2} size="h3" id="eligibility-heading">
                Who is eligible
              </Heading>
              <ul className="flex flex-col gap-2">
                {opportunity.eligibility.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-relaxed">
                    <CheckCircle2 className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby="requirements-heading" className="flex flex-col gap-3">
              <Heading level={2} size="h3" id="requirements-heading">
                What you will need
              </Heading>
              <ul className="flex flex-col gap-2">
                {opportunity.requirements.map((item) => (
                  <li key={item} className="flex gap-3 text-base leading-relaxed">
                    <FileText className="mt-1 size-4 shrink-0 text-cta" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <aside className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>At a glance</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="flex flex-col gap-4 text-sm">
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Deadline</dt>
                    <dd className="inline-flex items-center gap-2 font-medium">
                      <CalendarDays className="size-4 text-primary" aria-hidden="true" />
                      {formatDeadline(opportunity.deadline)}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="inline-flex items-center gap-2 font-medium">
                      <MapPin className="size-4 text-primary" aria-hidden="true" />
                      {opportunity.location}
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <dt className="text-muted-foreground">Your readiness</dt>
                    <dd>
                      <ReadinessBadge level="not-assessed" />
                    </dd>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <dt className="text-muted-foreground">Skills</dt>
                    <dd className="flex flex-wrap gap-1.5">
                      {opportunity.tags.map((tag) => (
                        <Badge key={tag} variant="neutral">
                          {tag}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            <PreviewNotice title="Readiness checks coming soon">
              Soon you will be able to compare your profile with these
              requirements and get a preparation plan.
            </PreviewNotice>
          </aside>
        </div>
      </Container>
    </Section>
  )
}
