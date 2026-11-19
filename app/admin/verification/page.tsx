import Link from 'next/link'

import { isSupabaseConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import {
  submitOpportunityForReview,
  verifyOpportunity,
} from './actions'

export const metadata = {
  title: 'Opportunity Verification | Find Admin',
}

export const dynamic = 'force-dynamic'

// These two records are deliberately excluded from operational verification views.
// HLI is a known legacy production exception; the archived internal test record is not live work.
const EXCLUDED_OPPORTUNITY_IDS = [
  '5b76e190-ba0c-466d-81d5-5c582f01d796',
  '2a6fb2f3-2104-4093-acf0-7cc68745c343',
] as const

const ALLOWED_STATUSES = new Set([
  'all',
  'unverified',
  'pending_review',
  'needs_update',
])

type Opportunity = {
  id: string
  title: string
  provider: string
  opportunity_type: string
  description: string | null
  eligibility: string | null
  academic_requirements: string | null
  skills_requirements: unknown
  required_documents: string[] | null
  funding_type: string | null
  deadline: string | null
  program_start_date: string | null
  program_end_date: string | null
  application_steps: string | null
  application_url: string | null
  official_source_url: string | null
  verification_status: string
  status: string
  created_at: string
  verification_notes: string | null
  next_review_at: string | null
  last_verified_at: string | null
}

type VerificationHistory = {
  id: string
  opportunity_id: string
  previous_status: string | null
  new_status: string | null
  reviewed_by: string | null
  official_source_url: string | null
  application_url: string | null
  review_notes: string | null
  verified_at: string | null
  created_at: string
}

type SearchParams = Promise<{
  q?: string | string[]
  status?: string | string[]
  success?: string | string[]
  error?: string | string[]
}>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function safeSearchTerm(value: string | undefined) {
  return (value || '').trim().slice(0, 100).toLowerCase()
}

function safeStatus(value: string | undefined) {
  return value && ALLOWED_STATUSES.has(value) ? value : 'all'
}

function safeFlashMessage(value: string | undefined) {
  // React escapes rendered text. The length limit prevents oversized query-string messages.
  return (value || '').slice(0, 200)
}

function safeExternalUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null

  try {
    const url = new URL(value)

    if (
      (url.protocol !== 'https:' && url.protocol !== 'http:') ||
      !url.hostname
    ) {
      return null
    }

    return url.href
  } catch {
    return null
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not specified'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not specified'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date)
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Not recorded'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function label(value: string | null | undefined) {
  return (value || 'unspecified').replaceAll('_', ' ')
}

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === 'verified'
      ? 'success'
      : status === 'pending_review'
        ? 'info'
        : status === 'needs_update'
          ? 'destructive'
          : 'warning'

  return (
    <Badge variant={variant} className="capitalize">
      {label(status)}
    </Badge>
  )
}

function displayList(value: unknown) {
  if (Array.isArray(value)) {
    return value.map(String).join(', ') || 'Not specified'
  }

  if (typeof value === 'string') {
    return value || 'Not specified'
  }

  if (value && typeof value === 'object') {
    return JSON.stringify(value)
  }

  return 'Not specified'
}

function MetricCard({
  title,
  value,
  detail,
  variant = 'neutral',
}: {
  title: string
  value: number | string
  detail: string
  variant?: 'neutral' | 'warning' | 'info' | 'success'
}) {
  const accent = {
    neutral: 'text-foreground',
    warning: 'text-amber-700 dark:text-amber-400',
    info: 'text-blue-700 dark:text-blue-400',
    success: 'text-emerald-700 dark:text-emerald-400',
  }[variant]

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className={`text-3xl ${accent}`}>
          {value}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </CardHeader>
    </Card>
  )
}

function Detail({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>

      <div className="break-words text-sm leading-6">
        {children || 'Not specified'}
      </div>
    </div>
  )
}

export default async function AdminVerificationPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  if (!isSupabaseConfigured()) return null

  const params = await searchParams

  const searchTerm = safeSearchTerm(first(params.q))
  const selectedStatus = safeStatus(first(params.status))
  const successMessage = safeFlashMessage(first(params.success))
  const errorMessage = safeFlashMessage(first(params.error))

  const supabase = await createClient()
  const excludedIds = [...EXCLUDED_OPPORTUNITY_IDS]

  const [
    pendingCountResult,
    unverifiedCountResult,
    needsUpdateCountResult,
    verifiedCountResult,
    queueResult,
    historyResult,
  ] = await Promise.all([
    supabase
      .from('opportunities')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'pending_review')
      .not('id', 'in', `(${excludedIds.join(',')})`),

    supabase
      .from('opportunities')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'draft')
      .eq('verification_status', 'unverified')
      .not('id', 'in', `(${excludedIds.join(',')})`),

    supabase
      .from('opportunities')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'needs_update')
      .not('id', 'in', `(${excludedIds.join(',')})`),

    supabase
      .from('opportunities')
      .select('id', { count: 'exact', head: true })
      .eq('verification_status', 'verified')
      .not('id', 'in', `(${excludedIds.join(',')})`),

    supabase
      .from('opportunities')
      .select(
        'id,title,provider,opportunity_type,description,eligibility,academic_requirements,skills_requirements,required_documents,funding_type,deadline,program_start_date,program_end_date,application_steps,application_url,official_source_url,verification_status,status,created_at,verification_notes,next_review_at,last_verified_at',
      )
      .eq('status', 'draft')
      .in('verification_status', [
        'unverified',
        'pending_review',
        'needs_update',
      ])
      .not('id', 'in', `(${excludedIds.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(100),

    supabase
      .from('opportunity_verification_history')
      .select(
        'id,opportunity_id,previous_status,new_status,reviewed_by,official_source_url,application_url,review_notes,verified_at,created_at',
      )
      .not('opportunity_id', 'in', `(${excludedIds.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  // Track failures independently so the dashboard never reports failed counts as zero.
  const queryErrors = [
    pendingCountResult.error,
    unverifiedCountResult.error,
    needsUpdateCountResult.error,
    verifiedCountResult.error,
    queueResult.error,
    historyResult.error,
  ]

  const failedQueries = queryErrors.filter(Boolean)

  if (failedQueries.length > 0) {
    console.error(
      '[admin/verification] One or more dashboard queries failed',
      {
        errorCodes: failedQueries.map((error) => error?.code || 'UNKNOWN'),
      },
    )
  }

  const statsFailed = Boolean(
    pendingCountResult.error ||
      unverifiedCountResult.error ||
      needsUpdateCountResult.error ||
      verifiedCountResult.error,
  )

  const queueFailed = Boolean(queueResult.error)
  const historyFailed = Boolean(historyResult.error)

  const queue = (queueResult.data ?? []) as Opportunity[]

  const filteredQueue = queue.filter((item) => {
    const matchesSearch =
      !searchTerm ||
      `${item.title} ${item.provider} ${item.opportunity_type}`
        .toLowerCase()
        .includes(searchTerm)

    const matchesStatus =
      selectedStatus === 'all' ||
      item.verification_status === selectedStatus

    return matchesSearch && matchesStatus
  })

  const history = (historyResult.data ?? []) as VerificationHistory[]

  const historyOpportunityIds = [
    ...new Set(history.map((item) => item.opportunity_id)),
  ]

  const historyTitles = new Map<string, string>()

  if (historyOpportunityIds.length > 0) {
    const { data: titleRows, error: titleError } = await supabase
      .from('opportunities')
      .select('id,title')
      .in('id', historyOpportunityIds)

    if (titleError) {
      console.error(
        '[admin/verification] Could not load history opportunity titles',
        {
          code: titleError.code || 'UNKNOWN',
        },
      )
    }

    for (const row of titleRows ?? []) {
      historyTitles.set(row.id, row.title)
    }
  }

  return (
    <section className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-semibold text-primary">
          Quality control
        </p>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-heading text-3xl font-bold">
              Verification
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Review official sources, deadlines, eligibility, requirements,
              and application details before an opportunity can move toward
              publication.
            </p>
          </div>

          <Link
            href="/admin/opportunities"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border-strong bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Manage opportunities
          </Link>
        </div>
      </header>

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-300"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {errorMessage}
        </div>
      )}

      {failedQueries.length > 0 && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          Some verification data could not be loaded. Please refresh the page
          or contact an administrator.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Pending review"
          value={
            statsFailed
              ? 'Unavailable'
              : pendingCountResult.count ?? 0
          }
          detail="Waiting for an administrator decision"
          variant="info"
        />

        <MetricCard
          title="Unverified drafts"
          value={
            statsFailed
              ? 'Unavailable'
              : unverifiedCountResult.count ?? 0
          }
          detail="Drafts not yet submitted to review"
          variant="warning"
        />

        <MetricCard
          title="Needs update"
          value={
            statsFailed
              ? 'Unavailable'
              : needsUpdateCountResult.count ?? 0
          }
          detail="Flagged for information to be corrected"
          variant="neutral"
        />

        <MetricCard
          title="Verified opportunities"
          value={
            statsFailed
              ? 'Unavailable'
              : verifiedCountResult.count ?? 0
          }
          detail="Verified; publication is a separate step"
          variant="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verification queue</CardTitle>

          <CardDescription>
            Only draft opportunities appear here. Published and archived
            records are not actionable from this queue.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <form
            method="get"
            className="grid gap-3 sm:grid-cols-[1fr_220px_auto]"
          >
            <Input
              name="q"
              placeholder="Search title, provider, or type…"
              defaultValue={first(params.q) || ''}
              maxLength={100}
              aria-label="Search verification queue"
            />

            <select
              name="status"
              defaultValue={selectedStatus}
              className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
            >
              <option value="all">All review statuses</option>
              <option value="unverified">Unverified</option>
              <option value="pending_review">Pending review</option>
              <option value="needs_update">Needs update</option>
            </select>

            <Button type="submit" variant="outline">
              Apply filters
            </Button>
          </form>

          {queueFailed ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-6 text-center text-sm text-destructive"
            >
              Could not load the verification queue. Please refresh the page.
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <p className="font-semibold">
                No opportunities in this view
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                There are currently no draft opportunities requiring
                verification. New drafts will appear here when they are ready
                for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueue.map((opportunity) => {
                const officialSourceUrl = safeExternalUrl(
                  opportunity.official_source_url,
                )

                const applicationUrl = safeExternalUrl(
                  opportunity.application_url,
                )

                return (
                  <article
                    key={opportunity.id}
                    className="overflow-hidden rounded-xl border border-border bg-background"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/30 p-4 sm:p-5">
                      <div className="min-w-0 space-y-1">
                        <h3 className="font-heading text-lg font-semibold">
                          {opportunity.title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                          {opportunity.provider} ·{' '}
                          <span className="capitalize">
                            {label(opportunity.opportunity_type)}
                          </span>
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Added {formatDateTime(opportunity.created_at)} ·
                          Deadline: {formatDate(opportunity.deadline)}
                        </p>
                      </div>

                      <StatusBadge
                        status={opportunity.verification_status}
                      />
                    </div>

                    <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
                      <div className="space-y-4">
                        <h4 className="font-semibold">
                          Opportunity information
                        </h4>

                        <Detail title="Description">
                          {opportunity.description}
                        </Detail>

                        <Detail title="Eligibility">
                          {opportunity.eligibility}
                        </Detail>

                        <Detail title="Academic requirements">
                          {opportunity.academic_requirements}
                        </Detail>

                        <Detail title="Required skills">
                          {displayList(opportunity.skills_requirements)}
                        </Detail>

                        <Detail title="Required documents">
                          {displayList(opportunity.required_documents)}
                        </Detail>

                        <Detail title="Funding">
                          {label(opportunity.funding_type)}
                        </Detail>

                        <div className="grid grid-cols-2 gap-4">
                          <Detail title="Program starts">
                            {formatDate(opportunity.program_start_date)}
                          </Detail>

                          <Detail title="Program ends">
                            {formatDate(opportunity.program_end_date)}
                          </Detail>
                        </div>

                        <Detail title="Application steps">
                          {opportunity.application_steps}
                        </Detail>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">
                          Source review
                        </h4>

                        <Detail title="Official source">
                          {officialSourceUrl ? (
                            <a
                              className="break-all text-primary underline underline-offset-4"
                              href={officialSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {opportunity.official_source_url}
                            </a>
                          ) : (
                            'Not provided or invalid URL'
                          )}
                        </Detail>

                        <Detail title="Application page">
                          {applicationUrl ? (
                            <a
                              className="break-all text-primary underline underline-offset-4"
                              href={applicationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {opportunity.application_url}
                            </a>
                          ) : (
                            'Not provided or invalid URL'
                          )}
                        </Detail>

                        {opportunity.last_verified_at && (
                          <Detail title="Last verified">
                            {formatDateTime(opportunity.last_verified_at)}
                          </Detail>
                        )}

                        {opportunity.verification_notes && (
                          <Detail title="Previous verification notes">
                            {opportunity.verification_notes}
                          </Detail>
                        )}

                        {opportunity.verification_status ===
                          'unverified' && (
                          <form
                            action={submitOpportunityForReview}
                            className="rounded-xl border border-border bg-muted/20 p-4"
                          >
                            <input
                              type="hidden"
                              name="opportunity_id"
                              value={opportunity.id}
                            />

                            <p className="text-sm font-semibold">
                              Ready for review?
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              Submitting moves this draft to Pending Review.
                              It does not publish the opportunity.
                            </p>

                            <Button type="submit" className="mt-4">
                              Submit for review
                            </Button>
                          </form>
                        )}

                        {opportunity.verification_status ===
                          'pending_review' && (
                          <form
                            action={verifyOpportunity}
                            className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4"
                          >
                            <input
                              type="hidden"
                              name="opportunity_id"
                              value={opportunity.id}
                            />

                            <p className="text-sm font-semibold">
                              Complete verification
                            </p>

                            <label className="block space-y-1.5">
                              <span className="text-sm font-medium">
                                Review notes{' '}
                                <span className="text-destructive">*</span>
                              </span>

                              <Textarea
                                name="review_notes"
                                required
                                minLength={3}
                                maxLength={5000}
                                placeholder="Record which official details and application information you checked…"
                              />
                            </label>

                            <label className="block space-y-1.5">
                              <span className="text-sm font-medium">
                                Next review date (optional)
                              </span>

                              <Input
                                type="date"
                                name="next_review_at"
                                min={new Date().toISOString().slice(0, 10)}
                              />
                            </label>

                            <p className="text-xs leading-5 text-muted-foreground">
                              Only verify after checking the provider’s
                              official source and confirming that the
                              application link and key details are current.
                              Verification does not publish the listing.
                            </p>

                            <Button type="submit">
                              Verify opportunity
                            </Button>
                          </form>
                        )}

                        {opportunity.verification_status ===
                          'needs_update' && (
                          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                            <p className="text-sm font-semibold">
                              Update required
                            </p>

                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                              This record is visible for review, but the
                              secure Needs Update transition is not configured
                              yet. No status-changing action is exposed here.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent verification history</CardTitle>

          <CardDescription>
            Read-only audit trail of verification status changes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {historyFailed ? (
            <p
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive"
            >
              Could not load verification history. Please refresh the page.
            </p>
          ) : history.length === 0 ? (
            <p className="rounded-lg bg-muted/30 p-5 text-sm text-muted-foreground">
              No opportunity verification activity has been recorded yet.
              Once an administrator verifies an opportunity, its audit trail
              will appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const officialSourceUrl = safeExternalUrl(
                  item.official_source_url,
                )

                const applicationUrl = safeExternalUrl(
                  item.application_url,
                )

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-semibold">
                        {historyTitles.get(item.opportunity_id) ||
                          'Opportunity'}
                      </div>

                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(
                          item.verified_at || item.created_at,
                        )}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                      <StatusBadge
                        status={item.previous_status || 'unknown'}
                      />

                      <span className="text-muted-foreground">→</span>

                      <StatusBadge
                        status={item.new_status || 'unknown'}
                      />
                    </div>

                    {item.review_notes && (
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {item.review_notes}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-4 text-xs">
                      {officialSourceUrl && (
                        <a
                          className="text-primary underline underline-offset-4"
                          href={officialSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Official source
                        </a>
                      )}

                      {applicationUrl && (
                        <a
                          className="text-primary underline underline-offset-4"
                          href={applicationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Application page
                        </a>
                      )}

                      {item.reviewed_by && (
                        <span className="text-muted-foreground">
                          Reviewer ID: {item.reviewed_by}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}