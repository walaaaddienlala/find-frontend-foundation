import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileText,
  Globe2,
  GraduationCap,
  MapPin,
  Wallet,
  BriefcaseBusiness,
  Mail,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { Container, Section } from '@/components/layout/page-container'
import { Heading, Text } from '@/components/shared/typography'
import { ReadinessBadge } from '@/components/shared/status-indicator'
import { StartApplicationButton } from '@/components/applications/start-application-button'

import {
  getOpportunityById,
  getOpportunities,
} from '@/lib/data/opportunities'

import { formatDeadline } from '@/lib/format'

import {
  opportunityTypeLabel,
  workModeLabel,
} from '@/lib/status'

import type {
  Opportunity,
  FundingType,
} from '@/lib/types'

type Props = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params
  const opportunity = await getOpportunityById(id)

  return opportunity
    ? {
        title: opportunity.title,
        description: opportunity.summary,
      }
    : {
        title: 'Opportunity not found',
      }
}

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
      return 'Not Specified'
  }
}

function getDeadlineInfo(deadline: string) {
  if (!deadline) {
    return {
      label: 'Not specified',
      status: 'unknown',
    }
  }

  const date = new Date(`${deadline}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) {
    return {
      label: 'Unavailable',
      status: 'unknown',
    }
  }

  const now = new Date()

  const today = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const remainingDays = Math.ceil(
    (date.getTime() - today) / (1000 * 60 * 60 * 24),
  )

  if (remainingDays < 0) {
    return {
      label: 'Deadline passed',
      status: 'closed',
    }
  }

  if (remainingDays === 0) {
    return {
      label: 'Deadline is today',
      status: 'closing',
    }
  }

  if (remainingDays <= 7) {
    return {
      label: `${remainingDays} days remaining`,
      status: 'closing',
    }
  }

  return {
    label: `${remainingDays} days remaining`,
    status: 'open',
  }
}

function getLocation(opportunity: Opportunity) {
  const parts = [
    opportunity.location,
    opportunity.country,
  ].filter(
    (value) =>
      value &&
      value !== 'Not specified',
  )

  return parts.length > 0
    ? Array.from(new Set(parts)).join(', ')
    : 'Location not specified'
}

function InformationSection({
  title,
  icon: Icon,
  items,
  emptyMessage,
}: {
  title: string
  icon: React.ElementType
  items: string[]
  emptyMessage: string
}) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Icon className="size-5 text-primary" aria-hidden="true" />
        <Heading level={2} size="h3">
          {title}
        </Heading>
      </div>

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li
              key={`${title}-${index}`}
              className="flex items-start gap-3 text-sm leading-relaxed"
            >
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      )}
    </section>
  )
}

export default async function OpportunityDetailPage({
  params,
}: Props) {
  const { id } = await params

  const opportunity = await getOpportunityById(id)

  if (!opportunity) notFound()

  const allOpportunities = await getOpportunities()

  const relatedOpportunities = allOpportunities
    .filter(
      (item) =>
        item.id !== opportunity.id &&
        (
          item.type === opportunity.type ||
          item.country === opportunity.country ||
          item.organization === opportunity.organization
        ),
    )
    .slice(0, 3)

  const deadlineInfo = getDeadlineInfo(opportunity.deadline)

  const isExternalApplication =
    opportunity.applicationUrl.startsWith('https://') ||
    opportunity.applicationUrl.startsWith('http://')

  const isExternalSource =
    opportunity.officialSourceUrl.startsWith('https://') ||
    opportunity.officialSourceUrl.startsWith('http://')

  return (
    <Section className="pt-8 sm:pt-10 lg:pt-12">
      <Container className="flex flex-col gap-8">

        {/* Back navigation */}
        <Link
          href="/opportunities"
          className={buttonVariants({
            variant: 'ghost',
            size: 'sm',
            className: '-ml-3 w-fit',
          })}
        >
          <ArrowLeft
            data-icon="inline-start"
            aria-hidden="true"
          />
          All opportunities
        </Link>

        {/* Main layout */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">

          {/* Main content */}
          <article className="flex min-w-0 flex-col gap-10">

            {/* Overview */}
            <header className="flex flex-col gap-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {opportunityTypeLabel[opportunity.type]}
                </Badge>

                <Badge variant="outline">
                  {workModeLabel[opportunity.workMode]}
                </Badge>

                <Badge variant="outline">
                  {getFundingLabel(opportunity.fundingType)}
                </Badge>
              </div>

              <div className="flex flex-col gap-2">
                <Heading level={1}>
                  {opportunity.title}
                </Heading>

                <Text variant="lead">
                  {opportunity.organization}
                </Text>
              </div>

              <Text>
                {opportunity.description}
              </Text>

              <div className="flex flex-wrap gap-2">
                {opportunity.tags.map((tag) => (
                  <Badge key={tag} variant="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
            </header>

            {/* Eligibility */}
            <InformationSection
              title="Who is eligible"
              icon={GraduationCap}
              items={opportunity.eligibility}
              emptyMessage="Eligibility information has not been provided yet."
            />

            {/* Academic requirements */}
            <InformationSection
              title="Academic Requirements"
              icon={GraduationCap}
              items={opportunity.academicRequirements}
              emptyMessage="No specific academic requirements have been provided."
            />

            {/* Skills */}
            <InformationSection
              title="Skills Requirements"
              icon={BriefcaseBusiness}
              items={opportunity.skillsRequirements}
              emptyMessage="No specific skills requirements have been provided."
            />

            {/* Required documents */}
            <InformationSection
              title="Required Documents"
              icon={FileText}
              items={opportunity.requiredDocuments}
              emptyMessage="Required documents have not been specified."
            />

            {/* General requirements */}
            {opportunity.requirements.length > 0 && (
              <InformationSection
                title="Additional Requirements"
                icon={CheckCircle2}
                items={opportunity.requirements}
                emptyMessage="No additional requirements."
              />
            )}

            {/* Funding */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Wallet
                  className="size-5 text-primary"
                  aria-hidden="true"
                />

                <Heading level={2} size="h3">
                  Benefits & Funding
                </Heading>
              </div>

              <Card>
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm text-muted-foreground">
                      Funding Type
                    </span>

                    <Badge variant="secondary">
                      {getFundingLabel(opportunity.fundingType)}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {opportunity.fundingType === 'fully_funded'
                      ? 'This opportunity is listed as fully funded.'
                      : opportunity.fundingType === 'partially_funded'
                        ? 'This opportunity is listed as partially funded. Check the official source for covered expenses.'
                        : opportunity.fundingType === 'unfunded'
                          ? 'This opportunity is listed as unfunded.'
                          : opportunity.fundingType === 'no_fee'
                            ? 'No application or participation fee is indicated.'
                            : 'Funding details have not been specified. Check the official source for more information.'}
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Program timeline */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <CalendarDays
                  className="size-5 text-primary"
                  aria-hidden="true"
                />

                <Heading level={2} size="h3">
                  Program Timeline
                </Heading>
              </div>

              <Card>
                <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      Program Start
                    </span>

                    <span className="font-medium">
                      {formatDeadline(opportunity.programStartDate)}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      Program End
                    </span>

                    <span className="font-medium">
                      {formatDeadline(opportunity.programEndDate)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* How to apply */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <ExternalLink
                  className="size-5 text-primary"
                  aria-hidden="true"
                />

                <Heading level={2} size="h3">
                  How to Apply
                </Heading>
              </div>

              <Card>
                <CardContent className="flex flex-col gap-4 p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Review the eligibility criteria and required
                    documents carefully before submitting your
                    application through the official application
                    platform.
                  </p>

                  <StartApplicationButton opportunityId={opportunity.id} />

                  {isExternalApplication ? (
                    <a
                      href={opportunity.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        className: 'w-fit',
                      })}
                    >
                      Apply Now
                      <ArrowUpRight
                        data-icon="inline-end"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      An official application link has not been provided.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Official source */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Globe2
                  className="size-5 text-primary"
                  aria-hidden="true"
                />

                <Heading level={2} size="h3">
                  Official Source
                </Heading>
              </div>

              {isExternalSource ? (
                <a
                  href={opportunity.officialSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Visit Official Website
                  <ExternalLink
                    className="size-4"
                    aria-hidden="true"
                  />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No official source link is available.
                </p>
              )}
            </section>

            {/* Contact */}
            {opportunity.contactInformation && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Mail
                    className="size-5 text-primary"
                    aria-hidden="true"
                  />

                  <Heading level={2} size="h3">
                    Contact Information
                  </Heading>
                </div>

                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {opportunity.contactInformation}
                </p>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">

            {/* At a glance */}
            <Card>
              <CardHeader>
                <CardTitle>
                  At a Glance
                </CardTitle>
              </CardHeader>

              <CardContent>
                <dl className="flex flex-col gap-5 text-sm">

                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">
                      Deadline
                    </dt>

                    <dd className="flex flex-wrap items-center gap-2 font-medium">
                      <CalendarDays
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />

                      {formatDeadline(opportunity.deadline)}
                    </dd>

                    <Badge
                      variant={
                        deadlineInfo.status === 'closed'
                          ? 'destructive'
                          : deadlineInfo.status === 'closing'
                            ? 'secondary'
                            : 'default'
                      }
                      className="mt-1 w-fit"
                    >
                      {deadlineInfo.status === 'closed'
                        ? 'Closed'
                        : deadlineInfo.status === 'closing'
                          ? 'Closing Soon'
                          : deadlineInfo.status === 'open'
                            ? 'Open'
                            : 'Not Specified'}
                    </Badge>
                  </div>

                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">
                      Country & Location
                    </dt>

                    <dd className="flex items-start gap-2 font-medium">
                      <MapPin
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />

                      {getLocation(opportunity)}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">
                      Delivery Mode
                    </dt>

                    <dd className="font-medium">
                      {workModeLabel[opportunity.workMode]}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-1">
                    <dt className="text-muted-foreground">
                      Funding
                    </dt>

                    <dd className="flex items-center gap-2 font-medium">
                      <Wallet
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />

                      {getFundingLabel(opportunity.fundingType)}
                    </dd>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <dt className="text-muted-foreground">
                      Your Readiness
                    </dt>

                    <dd>
                      <ReadinessBadge level="not-assessed" />
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Application CTA */}
            <Card>
              <CardContent className="flex flex-col gap-3 p-5">
                <Heading level={3} size="h3">
                  Ready to take the next step?
                </Heading>

                <StartApplicationButton opportunityId={opportunity.id} className="w-full" />

                {isExternalApplication ? (
                  <a
                    href={opportunity.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({
                      className: 'w-full',
                    })}
                  >
                    Apply Now
                    <ArrowUpRight
                      data-icon="inline-end"
                      aria-hidden="true"
                    />
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Application link unavailable.
                  </p>
                )}
              </CardContent>
            </Card>

          </aside>
        </div>

        {/* Related opportunities */}
        {relatedOpportunities.length > 0 && (
          <section className="flex flex-col gap-5 border-t border-border pt-8">
            <div>
              <Heading level={2}>
                Related Opportunities
              </Heading>

              <Text variant="muted">
                Explore other opportunities that may interest you.
              </Text>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedOpportunities.map((related) => (
                <Card
                  key={related.id}
                  className="transition-colors hover:border-primary/40"
                >
                  <CardContent className="flex flex-col gap-3 p-5">
                    <Badge variant="secondary" className="w-fit">
                      {opportunityTypeLabel[related.type]}
                    </Badge>

                    <div>
                      <h3 className="font-semibold leading-snug">
                        {related.title}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {related.organization}
                      </p>
                    </div>

                    <Link
                      href={`/opportunities/${related.id}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary"
                    >
                      View opportunity
                      <ArrowUpRight
                        className="size-4"
                        aria-hidden="true"
                      />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

      </Container>
    </Section>
  )
}