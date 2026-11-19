
'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  List,
  ListTodo,
  Target,
} from 'lucide-react'

import type { UserApplication } from '@/lib/data/applications'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'

export type TimelineTask = {
  id: string
  application_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  sort_order: number
  created_at: string
}

type TimelineFilter = 'all' | 'upcoming' | 'overdue' | 'completed'
type ViewMode = 'timeline' | 'calendar'

type TimelineItem = {
  id: string
  title: string
  description: string | null
  date: string
  type: 'task' | 'official_deadline' | 'personal_deadline'
  applicationTitle: string
  applicationId: string
  opportunityId: string
}

const statusConfig = {
  todo: {
    label: 'To Do',
    className: 'border-border bg-muted text-muted-foreground',
  },
  in_progress: {
    label: 'In Progress',
    className: 'border-blue-200 bg-blue-50 text-blue-700',
  },
  completed: {
    label: 'Completed',
    className: 'border-green-200 bg-green-50 text-green-700',
  },
} as const

const priorityConfig = {
  low: {
    label: 'Low Priority',
    className: 'border-border bg-muted text-muted-foreground',
  },
  medium: {
    label: 'Medium Priority',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  high: {
    label: 'High Priority',
    className: 'border-red-200 bg-red-50 text-red-700',
  },
} as const

const filterLabels: Record<TimelineFilter, string> = {
  all: 'All Events',
  upcoming: 'Upcoming',
  overdue: 'Overdue',
  completed: 'Completed',
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/**
 * Returns a normalized YYYY-MM-DD date key.
 *
 * A missing, undefined, empty, or whitespace-only due_date
 * is treated as having no deadline.
 */
function getTaskDueDateKey(task: TimelineTask): string | null {
  const dueDate = task.due_date

  if (typeof dueDate !== 'string' || dueDate.trim().length === 0) {
    return null
  }

  const dateKey = dueDate.trim().slice(0, 10)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return null
  }

  return dateKey
}

function hasTaskDueDate(task: TimelineTask): boolean {
  return getTaskDueDateKey(task) !== null
}

function getTodayDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDate(date: string) {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number)

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getDateLabel(date: string) {
  const today = getTodayDate()

  if (date === today) return 'Today'

  const [year, month, day] = date.split('-').map(Number)
  const targetDate = new Date(year, month - 1, day)

  const tomorrow = new Date()
  tomorrow.setHours(0, 0, 0, 0)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (
    targetDate.getFullYear() === tomorrow.getFullYear() &&
    targetDate.getMonth() === tomorrow.getMonth() &&
    targetDate.getDate() === tomorrow.getDate()
  ) {
    return 'Tomorrow'
  }

  return formatDate(date)
}

function getDaysUntil(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const target = new Date(year, month - 1, day)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)

  return Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
}

function getTaskState(task: TimelineTask) {
  if (task.status === 'completed') return 'completed'

  const dueDate = getTaskDueDateKey(task)

  if (!dueDate) return 'no_deadline'

  if (dueDate < getTodayDate()) return 'overdue'

  return 'upcoming'
}

function getTaskStateLabel(task: TimelineTask) {
  const state = getTaskState(task)

  if (state === 'completed') return 'Completed'
  if (state === 'overdue') return 'Overdue'
  if (state === 'no_deadline') return 'No deadline'

  const dueDate = getTaskDueDateKey(task)

  if (!dueDate) return 'No deadline'

  const days = getDaysUntil(dueDate)

  if (days === 0) return 'Due today'
  if (days === 1) return 'Due tomorrow'

  return `Due in ${days} days`
}

function getTaskStateClass(task: TimelineTask) {
  const state = getTaskState(task)

  if (state === 'completed') {
    return 'border-green-200 bg-green-50 text-green-700'
  }

  if (state === 'overdue') {
    return 'border-red-200 bg-red-50 text-red-700'
  }

  if (state === 'no_deadline') {
    return 'border-border bg-muted text-muted-foreground'
  }

  return 'border-blue-200 bg-blue-50 text-blue-700'
}

function getTaskIcon(task: TimelineTask) {
  if (task.status === 'completed') return CheckCircle2
  if (getTaskState(task) === 'overdue') return AlertCircle

  return ListTodo
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startingOffset = (firstDay.getDay() + 6) % 7

  return [
    ...Array.from({ length: startingOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
}

function getDeadlineConfig(type: TimelineItem['type']) {
  if (type === 'official_deadline') {
    return {
      label: 'Official Deadline',
      badgeClass: 'border-primary/20 bg-primary/10 text-primary',
      iconClass: 'bg-primary/10 text-primary',
      dotClass: 'bg-primary',
      calendarClass: 'bg-primary/10 text-primary',
    }
  }

  if (type === 'personal_deadline') {
    return {
      label: 'Personal Deadline',
      badgeClass: 'border-violet-200 bg-violet-50 text-violet-700',
      iconClass: 'bg-violet-50 text-violet-700',
      dotClass: 'bg-violet-500',
      calendarClass: 'bg-violet-100 text-violet-700',
    }
  }

  return null
}

export function ApplicationTimeline({
  applications,
  tasks,
}: {
  applications: UserApplication[]
  tasks: TimelineTask[]
}) {
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('timeline')

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const today = getTodayDate()

  const applicationMap = useMemo(
    () =>
      new Map(
        applications.map((application) => [application.id, application]),
      ),
    [applications],
  )

  const timelineItems: TimelineItem[] = []

  // Preparation tasks with valid due dates
  for (const task of tasks) {
    const application = applicationMap.get(task.application_id)
    const dueDate = getTaskDueDateKey(task)

    if (!application || !dueDate) continue

    timelineItems.push({
      id: `task-${task.id}`,
      title: task.title,
      description: task.description,
      date: dueDate,
      type: 'task',
      applicationTitle: application.opportunity.title,
      applicationId: application.id,
      opportunityId: application.opportunity.id,
    })
  }

  // Official and personal application deadlines
  for (const application of applications) {
    const officialDeadline = application.opportunity.deadline
    const personalDeadline = application.applicationDeadline

    if (officialDeadline) {
      timelineItems.push({
        id: `official-deadline-${application.id}`,
        title: 'Official application deadline',
        description:
          'The official deadline provided by the opportunity organizer.',
        date: officialDeadline.slice(0, 10),
        type: 'official_deadline',
        applicationTitle: application.opportunity.title,
        applicationId: application.id,
        opportunityId: application.opportunity.id,
      })
    }

    if (personalDeadline) {
      timelineItems.push({
        id: `personal-deadline-${application.id}`,
        title: 'Personal application deadline',
        description:
          'Your personal target date for completing and submitting this application.',
        date: personalDeadline.slice(0, 10),
        type: 'personal_deadline',
        applicationTitle: application.opportunity.title,
        applicationId: application.id,
        opportunityId: application.opportunity.id,
      })
    }
  }

  timelineItems.sort((a, b) => a.date.localeCompare(b.date))

  const activeTasks = tasks.filter((task) => task.status !== 'completed')
  const completedTasks = tasks.filter((task) => task.status === 'completed')

  const overdueTasks = activeTasks.filter((task) => {
    const dueDate = getTaskDueDateKey(task)
    return dueDate !== null && dueDate < today
  })

  const upcomingTasks = activeTasks.filter((task) => {
    const dueDate = getTaskDueDateKey(task)
    return dueDate !== null && dueDate >= today
  })

  const noDeadlineTasks = activeTasks.filter(
    (task) => !hasTaskDueDate(task),
  )

  const completedDatedTasks = completedTasks.filter(hasTaskDueDate)

  const deadlineItems = timelineItems.filter(
    (item) => item.type !== 'task',
  )

  const overdueDeadlines = deadlineItems.filter(
    (item) => item.date < today,
  )

  const upcomingDeadlines = deadlineItems.filter(
    (item) => item.date >= today,
  )

  const upcomingEventsCount =
    upcomingTasks.length + upcomingDeadlines.length

  const overdueEventsCount =
    overdueTasks.length + overdueDeadlines.length

  const nextDeadline = [...upcomingDeadlines].sort(
    (a, b) => a.date.localeCompare(b.date),
  )[0]

  const filteredItems = timelineItems.filter((item) => {
    if (activeFilter === 'all') return true

    if (item.type !== 'task') {
      if (activeFilter === 'upcoming') return item.date >= today
      if (activeFilter === 'overdue') return item.date < today

      return false
    }

    const task = tasks.find((entry) => `task-${entry.id}` === item.id)

    if (!task) return false

    const dueDate = getTaskDueDateKey(task)

    if (activeFilter === 'upcoming') {
      return (
        task.status !== 'completed' &&
        dueDate !== null &&
        dueDate >= today
      )
    }

    if (activeFilter === 'overdue') {
      return (
        task.status !== 'completed' &&
        dueDate !== null &&
        dueDate < today
      )
    }

    return task.status === 'completed'
  })

  const agendaItems = filteredItems
    .filter((item) => {
      if (activeFilter === 'all') {
        if (item.date < today) return false

        if (item.type !== 'task') return true

        const task = tasks.find((entry) => `task-${entry.id}` === item.id)
        return task?.status !== 'completed'
      }

      return true
    })
    .sort((a, b) => {
      if (activeFilter === 'overdue' || activeFilter === 'completed') {
        return b.date.localeCompare(a.date)
      }

      return a.date.localeCompare(b.date)
    })
    .slice(0, 5)

  const agendaTitle =
    activeFilter === 'overdue'
      ? 'Overdue at a Glance'
      : activeFilter === 'completed'
        ? 'Completed at a Glance'
        : 'Upcoming at a Glance'

  const agendaDescription =
    activeFilter === 'overdue'
      ? 'Your overdue tasks and application deadlines.'
      : activeFilter === 'completed'
        ? 'Your recently completed tasks.'
        : 'Your next five tasks and application deadlines.'

  const groupedItems = filteredItems.reduce<Record<string, TimelineItem[]>>(
    (groups, item) => {
      if (!groups[item.date]) groups[item.date] = []
      groups[item.date].push(item)
      return groups
    },
    {},
  )

  const sortedDates = Object.keys(groupedItems).sort()

  const filterCounts: Record<TimelineFilter, number> = {
    all: timelineItems.length,
    upcoming: upcomingEventsCount,
    overdue: overdueEventsCount,
    completed: completedDatedTasks.length,
  }

  const calendarDays = getCalendarDays(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
  )

  const calendarItemsByDate = new Map<string, TimelineItem[]>()

  for (const item of filteredItems) {
    const existing = calendarItemsByDate.get(item.date) ?? []
    calendarItemsByDate.set(item.date, [...existing, item])
  }

  const selectedDateItems = selectedDate
    ? calendarItemsByDate.get(selectedDate) ?? []
    : []

  function changeMonth(direction: number) {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + direction,
          1,
        ),
    )
    setSelectedDate(null)
  }

  function selectFilter(filter: TimelineFilter) {
    setActiveFilter(filter)
    setSelectedDate(null)
  }

  const filterOptions: {
    value: TimelineFilter
    label: string
    icon: typeof CalendarDays
    className: string
    activeClassName: string
  }[] = [
    {
      value: 'all',
      label: 'All Events',
      icon: CalendarDays,
      className: 'border-border text-muted-foreground hover:bg-muted',
      activeClassName: 'border-primary bg-primary text-primary-foreground',
    },
    {
      value: 'upcoming',
      label: 'Upcoming',
      icon: Clock3,
      className: 'border-blue-200 text-blue-700 hover:bg-blue-50',
      activeClassName: 'border-blue-600 bg-blue-600 text-white',
    },
    {
      value: 'overdue',
      label: 'Overdue',
      icon: AlertCircle,
      className: 'border-red-200 text-red-700 hover:bg-red-50',
      activeClassName: 'border-red-600 bg-red-600 text-white',
    },
    {
      value: 'completed',
      label: 'Completed',
      icon: CheckCircle2,
      className: 'border-green-200 text-green-700 hover:bg-green-50',
      activeClassName: 'border-green-600 bg-green-600 text-white',
    },
  ]

  function renderEvent(item: TimelineItem) {
    const isTask = item.type === 'task'
    const deadlineConfig = getDeadlineConfig(item.type)

    const task = isTask
      ? tasks.find((entry) => `task-${entry.id}` === item.id)
      : undefined

    const TaskIcon = task ? getTaskIcon(task) : Flag
    const taskStatus = task ? statusConfig[task.status] : null
    const priority = task ? priorityConfig[task.priority] : null

    return (
      <article
        key={item.id}
        className="rounded-xl border border-border bg-background p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <TaskIcon className="size-4 text-muted-foreground" />
                <h5 className="font-semibold">{item.title}</h5>
              </div>

              {deadlineConfig ? (
                <Badge className={deadlineConfig.badgeClass}>
                  {deadlineConfig.label}
                </Badge>
              ) : (
                <>
                  {task && (
                    <Badge
                      variant="outline"
                      className={getTaskStateClass(task)}
                    >
                      {getTaskStateLabel(task)}
                    </Badge>
                  )}

                  {priority && (
                    <Badge variant="outline" className={priority.className}>
                      {priority.label}
                    </Badge>
                  )}
                </>
              )}
            </div>

            {item.description && (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            )}

            <p className="mt-2 text-sm text-muted-foreground">
              {item.applicationTitle}
            </p>

            <p className="mt-2 text-xs text-muted-foreground">
              {formatDate(item.date)}
            </p>
          </div>

          <Link
            href={`/opportunities/${item.opportunityId}`}
            className={buttonVariants({
              size: 'sm',
              variant: 'outline',
              className: 'shrink-0',
            })}
          >
            View application
          </Link>
        </div>

        {taskStatus && (
          <div className="mt-3">
            <Badge variant="outline" className={taskStatus.className}>
              {taskStatus.label}
            </Badge>
          </div>
        )}
      </article>
    )
  }

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <CalendarDays className="size-5 text-primary" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Application Timeline
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your tasks and important application dates in one place.
            </p>
          </div>
        </div>

        {nextDeadline && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">
              Next application deadline
            </p>

            <p className="mt-1 font-semibold">
              {formatDate(nextDeadline.date)}
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              {nextDeadline.applicationTitle}
            </p>

            <Badge
              className={`mt-2 ${
                nextDeadline.type === 'official_deadline'
                  ? 'border-primary/20 bg-primary/10 text-primary'
                  : 'border-violet-200 bg-violet-50 text-violet-700'
              }`}
            >
              {nextDeadline.type === 'official_deadline'
                ? 'Official Deadline'
                : 'Personal Deadline'}
            </Badge>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <button
          type="button"
          onClick={() => selectFilter('upcoming')}
          aria-pressed={activeFilter === 'upcoming'}
          className={`rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activeFilter === 'upcoming'
              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
              : 'border-border bg-card hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Upcoming</p>
            <Clock3 className="size-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{upcomingEventsCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tasks and deadlines
          </p>
        </button>

        <button
          type="button"
          onClick={() => selectFilter('overdue')}
          aria-pressed={activeFilter === 'overdue'}
          className={`rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activeFilter === 'overdue'
              ? 'border-red-500 bg-red-50 ring-1 ring-red-500'
              : 'border-border bg-card hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <AlertCircle className="size-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{overdueEventsCount}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tasks and deadlines past due
          </p>
        </button>

        <button
          type="button"
          onClick={() => selectFilter('completed')}
          aria-pressed={activeFilter === 'completed'}
          className={`rounded-xl border p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            activeFilter === 'completed'
              ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
              : 'border-border bg-card hover:border-green-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Completed</p>
            <CheckCircle2 className="size-4 text-green-600" />
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {completedDatedTasks.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Completed dated tasks
          </p>
        </button>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">No Deadline</p>
            <Target className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {noDeadlineTasks.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Tasks without a due date
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {activeFilter === 'all'
                ? 'Your schedule'
                : `${filterLabels[activeFilter]} events`}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your application dates and preparation tasks.
            </p>
          </div>

          <div className="flex w-fit rounded-lg border border-border bg-muted p-1">
            <button
              type="button"
              onClick={() => setViewMode('timeline')}
              aria-pressed={viewMode === 'timeline'}
              className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="size-4" />
              Timeline
            </button>

            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              aria-pressed={viewMode === 'calendar'}
              className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarDays className="size-4" />
              Calendar
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon
            const isActive = activeFilter === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => selectFilter(option.value)}
                aria-pressed={isActive}
                className={`inline-flex min-h-10 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  isActive ? option.activeClassName : option.className
                }`}
              >
                <Icon className="size-4" />
                {option.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive ? 'bg-white/20' : 'bg-muted'
                  }`}
                >
                  {filterCounts[option.value]}
                </span>
              </button>
            )
          })}
        </div>

        {viewMode === 'timeline' && (
          <>
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                  {activeFilter === 'completed' || activeFilter === 'overdue' ? (
                    <CheckCircle2 className="size-6 text-muted-foreground" />
                  ) : (
                    <CalendarDays className="size-6 text-muted-foreground" />
                  )}
                </div>

                <h4 className="mt-4 font-semibold">
                  {activeFilter === 'completed'
                    ? 'No completed tasks yet'
                    : activeFilter === 'overdue'
                      ? 'No overdue events'
                      : activeFilter === 'upcoming'
                        ? 'No upcoming events'
                        : 'No scheduled events yet'}
                </h4>

                <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                  {activeFilter === 'completed'
                    ? 'Tasks you mark as completed will appear here.'
                    : activeFilter === 'overdue'
                      ? 'You are all caught up. There are no overdue tasks or deadlines.'
                      : activeFilter === 'upcoming'
                        ? 'There are no upcoming tasks or deadlines at the moment.'
                        : 'Tasks with due dates and application deadlines will appear here automatically.'}
                </p>

                {activeFilter !== 'all' && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-5"
                    onClick={() => selectFilter('all')}
                  >
                    View all events
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-8 space-y-8">
                {sortedDates.map((date) => (
                  <div key={date} className="relative">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <CalendarDays className="size-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {getDateLabel(date)}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(date)}
                        </p>
                      </div>
                    </div>

                    <div className="ml-4 space-y-3 border-l-2 border-border pl-7">
                      {groupedItems[date].map((item) => {
                        const task = tasks.find(
                          (entry) => `task-${entry.id}` === item.id,
                        )

                        const deadlineConfig = getDeadlineConfig(item.type)

                        const eventColor = deadlineConfig
                          ? deadlineConfig.dotClass
                          : task?.status === 'completed'
                            ? 'bg-green-500'
                            : task && getTaskState(task) === 'overdue'
                              ? 'bg-red-500'
                              : 'bg-blue-500'

                        return (
                          <div key={item.id} className="relative">
                            <div
                              className={`absolute -left-[2.05rem] top-5 size-3 rounded-full border-2 border-background ${eventColor}`}
                            />
                            {renderEvent(item)}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {viewMode === 'calendar' && (
          <div className="mt-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h4 className="text-xl font-semibold">
                  {formatMonth(currentMonth)}
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  Select a day to view its events.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentMonth(
                      new Date(
                        new Date().getFullYear(),
                        new Date().getMonth(),
                        1,
                      ),
                    )
                    setSelectedDate(today)
                  }}
                >
                  Today
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Previous month"
                  onClick={() => changeMonth(-1)}
                >
                  <ChevronLeft className="size-4" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Next month"
                  onClick={() => changeMonth(1)}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>

            <div className="mb-6 rounded-xl border border-border bg-muted/20 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-semibold">{agendaTitle}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {agendaDescription}
                  </p>
                </div>
                <Badge variant="secondary">
                  {agendaItems.length} events
                </Badge>
              </div>

              {agendaItems.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {agendaItems.map((item) => {
                    const isTask = item.type === 'task'
                    const deadlineConfig = getDeadlineConfig(item.type)

                    const task = isTask
                      ? tasks.find((entry) => `task-${entry.id}` === item.id)
                      : undefined

                    const daysRemaining = getDaysUntil(item.date)
                    const isCompleted = task?.status === 'completed'
                    const isOverdue =
                      !isCompleted && item.date < today

                    const iconClass = deadlineConfig
                      ? deadlineConfig.iconClass
                      : isCompleted
                        ? 'bg-green-50 text-green-600'
                        : isOverdue
                          ? 'bg-red-50 text-red-600'
                          : 'bg-blue-50 text-blue-600'

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
                          >
                            {deadlineConfig ? (
                              <Flag className="size-5" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="size-5" />
                            ) : isOverdue ? (
                              <AlertCircle className="size-5" />
                            ) : (
                              <ListTodo className="size-5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-medium">{item.title}</p>

                              <Badge
                                variant="outline"
                                className={
                                  deadlineConfig
                                    ? deadlineConfig.badgeClass
                                    : isCompleted
                                      ? 'border-green-200 bg-green-50 text-green-700'
                                      : isOverdue
                                        ? 'border-red-200 bg-red-50 text-red-700'
                                        : 'border-blue-200 bg-blue-50 text-blue-700'
                                }
                              >
                                {deadlineConfig
                                  ? deadlineConfig.label
                                  : isCompleted
                                    ? 'Completed'
                                    : isOverdue
                                      ? 'Overdue'
                                      : 'Task'}
                              </Badge>
                            </div>

                            <p className="mt-1 truncate text-sm text-muted-foreground">
                              {item.applicationTitle}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatDate(item.date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end">
                          <span
                            className={`text-sm font-medium ${
                              isCompleted
                                ? 'text-green-600'
                                : isOverdue
                                  ? 'text-red-600'
                                  : daysRemaining <= 3
                                    ? 'text-amber-600'
                                    : 'text-muted-foreground'
                            }`}
                          >
                            {isCompleted
                              ? 'Completed'
                              : isOverdue
                                ? `${Math.abs(daysRemaining)} days overdue`
                                : daysRemaining === 0
                                  ? 'Today'
                                  : daysRemaining === 1
                                    ? 'Tomorrow'
                                    : `In ${daysRemaining} days`}
                          </span>

                          <Link
                            href={`/opportunities/${item.opportunityId}`}
                            className={buttonVariants({
                              size: 'sm',
                              variant: 'ghost',
                            })}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-background py-6 text-center text-sm text-muted-foreground">
                  {activeFilter === 'overdue'
                    ? 'Great! You have no overdue tasks or deadlines.'
                    : activeFilter === 'completed'
                      ? 'No completed tasks yet.'
                      : 'No upcoming tasks or deadlines. You are all caught up!'}
                </p>
              )}
            </div>

            <div className="overflow-hidden rounded-xl border border-border">
              <div className="grid grid-cols-7 border-b border-border bg-muted/50">
                {weekdays.map((day) => (
                  <div
                    key={day}
                    className="px-1 py-3 text-center text-xs font-semibold text-muted-foreground sm:px-3 sm:text-sm"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-20 border-b border-r border-border bg-muted/20 sm:min-h-28"
                      />
                    )
                  }

                  const date = toDateKey(
                    new Date(
                      currentMonth.getFullYear(),
                      currentMonth.getMonth(),
                      day,
                    ),
                  )

                  const dayItems = calendarItemsByDate.get(date) ?? []
                  const isToday = date === today
                  const isSelected = date === selectedDate

                  const hasOfficialDeadline = dayItems.some(
                    (item) => item.type === 'official_deadline',
                  )

                  const hasPersonalDeadline = dayItems.some(
                    (item) => item.type === 'personal_deadline',
                  )

                  const hasCompletedTask = dayItems.some((item) => {
                    if (item.type !== 'task') return false

                    return tasks.find(
                      (task) => `task-${task.id}` === item.id,
                    )?.status === 'completed'
                  })

                  const hasOverdueTask = dayItems.some((item) => {
                    if (item.type !== 'task') return false

                    const task = tasks.find(
                      (entry) => `task-${entry.id}` === item.id,
                    )

                    return task ? getTaskState(task) === 'overdue' : false
                  })

                  return (
                    <button
                      key={date}
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      aria-label={`${formatDate(date)}, ${dayItems.length} events`}
                      aria-pressed={isSelected}
                      className={`relative flex min-h-20 flex-col items-center border-b border-r border-border p-1 text-center transition-colors hover:bg-muted/60 sm:min-h-28 sm:items-start sm:p-3 ${
                        isSelected
                          ? 'bg-primary/10 ring-2 ring-inset ring-primary'
                          : 'bg-background'
                      }`}
                    >
                      <span
                        className={`flex size-7 items-center justify-center rounded-full text-sm font-medium ${
                          isToday
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        {day}
                      </span>

                      {dayItems.length > 0 && (
                        <>
                          <div className="mt-2 hidden w-full space-y-1 sm:block">
                            {dayItems.slice(0, 2).map((item) => {
                              const task = tasks.find(
                                (entry) => `task-${entry.id}` === item.id,
                              )

                              const deadlineConfig = getDeadlineConfig(
                                item.type,
                              )

                              const eventClass = deadlineConfig
                                ? deadlineConfig.calendarClass
                                : task?.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : task && getTaskState(task) === 'overdue'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'

                              return (
                                <div
                                  key={item.id}
                                  className={`truncate rounded px-1.5 py-1 text-left text-[10px] font-medium ${eventClass}`}
                                >
                                  {deadlineConfig
                                    ? item.type === 'official_deadline'
                                      ? 'Official deadline'
                                      : 'Personal deadline'
                                    : item.title}
                                </div>
                              )
                            })}

                            {dayItems.length > 2 && (
                              <p className="text-left text-[10px] text-muted-foreground">
                                +{dayItems.length - 2} more
                              </p>
                            )}
                          </div>

                          <div className="mt-2 flex items-center justify-center gap-1 sm:hidden">
                            {hasOfficialDeadline && (
                              <span className="size-1.5 rounded-full bg-primary" />
                            )}

                            {hasPersonalDeadline && (
                              <span className="size-1.5 rounded-full bg-violet-500" />
                            )}

                            {!hasOfficialDeadline &&
                              !hasPersonalDeadline && (
                                <span
                                  className={`size-1.5 rounded-full ${
                                    hasOverdueTask
                                      ? 'bg-red-500'
                                      : hasCompletedTask
                                        ? 'bg-green-500'
                                        : 'bg-blue-500'
                                  }`}
                                />
                              )}

                            {dayItems.length > 1 && (
                              <span className="text-[10px] text-muted-foreground">
                                {dayItems.length}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500" />
                Upcoming tasks
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-red-500" />
                Overdue tasks
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500" />
                Completed tasks
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-primary" />
                Official deadline
              </span>

              <span className="inline-flex items-center gap-2">
                <span className="size-2 rounded-full bg-violet-500" />
                Personal deadline
              </span>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-background p-4 sm:p-5">
              {selectedDate ? (
                <>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="font-semibold">
                        {getDateLabel(selectedDate)}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(selectedDate)}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      {selectedDateItems.length}{' '}
                      {selectedDateItems.length === 1 ? 'event' : 'events'}
                    </Badge>
                  </div>

                  {selectedDateItems.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {selectedDateItems.map((item) => renderEvent(item))}
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No events scheduled for this day.
                    </p>
                  )}
                </>
              ) : (
                <div className="py-6 text-center">
                  <CalendarDays className="mx-auto size-8 text-muted-foreground" />
                  <h4 className="mt-3 font-semibold">Select a date</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Choose a day on the calendar to see its tasks and deadlines.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {noDeadlineTasks.length > 0 && (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ListTodo className="size-5 text-muted-foreground" />
            <h3 className="font-semibold">Tasks without a deadline</h3>
            <Badge variant="secondary">{noDeadlineTasks.length}</Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            These tasks do not have a due date yet.
          </p>

          <div className="mt-4 space-y-3">
            {noDeadlineTasks.map((task) => {
              const application = applicationMap.get(task.application_id)
              if (!application) return null

              return (
                <div
                  key={task.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {application.opportunity.title}
                    </p>
                  </div>

                  <Badge variant="outline">No deadline</Badge>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
