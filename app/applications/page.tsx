
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Target,
} from 'lucide-react'

import { isSupabaseConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import {
  getUserApplications,
  type UserApplication,
} from '@/lib/data/applications'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

import { ApplicationManager } from '@/components/applications/application-manager'
import {
  ApplicationTimeline,
  type TimelineTask,
} from '@/components/applications/application-timeline'

type ApplicationTask = TimelineTask

const statusConfig: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
  }
> = {
  saved: { label: 'Saved', variant: 'secondary' },
  preparing: { label: 'Preparing', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'default' },
  submitted: { label: 'Submitted', variant: 'success' },
  interview: { label: 'Interview', variant: 'success' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  waitlisted: { label: 'Waitlisted', variant: 'warning' },
}

function formatDate(date: string | null | undefined) {
  if (!date) return 'No deadline'

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No deadline'
  }

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

export default async function ApplicationsPage() {
  if (!isSupabaseConfigured()) {
    redirect('/opportunities')
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  let applications: UserApplication[] = []

  try {
    applications = await getUserApplications()
  } catch (error) {
    console.error('Error loading applications:', error)
  }

  const safeApplications = applications

  const applicationIds = safeApplications.map(
    (application) => application.id,
  )

  let tasks: ApplicationTask[] = []

  if (applicationIds.length > 0) {
    const {
      data: tasksData,
      error: tasksError,
    } = await supabase
      .from('application_tasks')
      .select(
        'id, application_id, title, description, status, priority, due_date, sort_order, created_at',
      )
      .in('application_id', applicationIds)
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (tasksError) {
      console.error('Error loading application tasks:', tasksError)
    } else {
      tasks = (tasksData ?? []) as ApplicationTask[]
    }
  }

  const totalApplications = safeApplications.length

  const submittedApplications = safeApplications.filter((application) =>
    [
      'submitted',
      'interview',
      'accepted',
      'rejected',
      'waitlisted',
    ].includes(application.status),
  ).length

  const inProgressApplications = safeApplications.filter((application) =>
    ['preparing', 'in_progress'].includes(application.status),
  ).length

  const upcomingDeadlines = safeApplications.filter((application) => {
    const officialDeadline = application.opportunity?.deadline

    if (!officialDeadline) return false

    const deadlineDate = new Date(officialDeadline)

    return (
      !Number.isNaN(deadlineDate.getTime()) &&
      deadlineDate >= new Date()
    )
  }).length

  return (
    <main
      id="main-content"
      className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Page Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          My Applications
        </h1>

        <p className="mt-2 text-muted-foreground">
          Manage your applications, track your preparation, and stay on top
          of important deadlines.
        </p>
      </header>

      {/* Overview */}
      <section className="mt-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Total Applications
              </p>
              <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {totalApplications}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                In Progress
              </p>
              <Clock3 className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {inProgressApplications}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Submitted
              </p>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {submittedApplications}
            </p>
          </div>

          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Upcoming Official Deadlines
              </p>
              <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </div>

            <p className="mt-3 text-3xl font-semibold">
              {upcomingDeadlines}
            </p>
          </div>
        </div>
      </section>

      {/* Application Timeline */}
      {safeApplications.length > 0 && (
        <section className="mt-10">
          <ApplicationTimeline
            applications={safeApplications}
            tasks={tasks}
          />
        </section>
      )}

      {/* Applications List */}
      <section className="mt-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              Your Applications
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Track and manage every opportunity you are applying for.
            </p>
          </div>

          <Link href="/opportunities" className={buttonVariants()}>
            Discover Opportunities
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {safeApplications.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <BriefcaseBusiness className="h-6 w-6 text-muted-foreground" />
            </div>

            <h3 className="mt-4 text-lg font-semibold">
              No applications yet
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Start exploring opportunities and save the ones you want to
              apply for. Your applications will appear here.
            </p>

            <Link
              href="/opportunities"
              className={buttonVariants({ className: 'mt-6' })}
            >
              Explore Opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {safeApplications.map((application) => {
              const applicationTasks = tasks.filter(
                (task) => task.application_id === application.id,
              )

              const completedTasks = applicationTasks.filter(
                (task) => task.status === 'completed',
              ).length

              // Document readiness is calculated from checklist items only.
              // Task completion remains a separate metric below.
              const progress = application.preparationProgress ?? 0

              const status = statusConfig[application.status] ?? {
                label: application.status,
                variant: 'secondary' as const,
              }

              // Official deadline belongs to the opportunity.
              const officialDeadline =
                application.opportunity?.deadline ?? null

              return (
                <article
                  key={application.id}
                  className="overflow-hidden rounded-xl border bg-card"
                >
                  {/* Application Header */}
                  <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={status.variant}>
                          {status.label}
                        </Badge>

                        {application.opportunityUnavailable && (
                          <Badge variant="warning">Opportunity unavailable</Badge>
                        )}

                        {officialDeadline && (
                          <Badge variant="outline">
                            <CalendarDays className="mr-1 h-3 w-3" />
                            Official deadline:{' '}
                            {formatDate(officialDeadline)}
                          </Badge>
                        )}
                      </div>

                      <h3 className="mt-3 text-xl font-semibold">
                        {application.opportunity?.title ??
                          'Untitled Opportunity'}
                      </h3>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {application.opportunity?.organization ??
                          'Organization not specified'}
                      </p>
                    </div>

                    {!application.opportunityUnavailable && application.opportunity?.id && (
                      <Link
                        href={`/opportunities/${application.opportunity.id}`}
                        className={buttonVariants({
                          variant: 'outline',
                          className: 'shrink-0',
                        })}
                      >
                        View Opportunity
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    )}
                  </div>

                  {/* Application Progress */}
                  <div className="grid gap-4 border-b p-5 sm:grid-cols-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="h-4 w-4" />
                        Preparation Progress
                      </div>

                      <p className="mt-2 text-2xl font-semibold">
                        {progress}%
                      </p>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(0, progress))}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed Tasks
                      </div>

                      <p className="mt-2 text-2xl font-semibold">
                        {completedTasks}/{applicationTasks.length}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        Official Opportunity Deadline
                      </div>

                      <p className="mt-2 text-lg font-semibold">
                        {formatDate(officialDeadline)}
                      </p>
                    </div>
                  </div>

                  {/* Application Manager */}
                  <div className="p-5">
                    <ApplicationManager
                      applicationId={application.id}
                      currentStatus={application.status}
                      deadline={officialDeadline}
                      personalDeadline={
                        application.applicationDeadline
                      }
                      notes={application.notes}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
