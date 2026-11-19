'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react'
import { useRouter } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'

type TaskStatus = 'todo' | 'in_progress' | 'completed'

type TaskPriority = 'low' | 'medium' | 'high'

type ApplicationTask = {
  id: string
  application_id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

type TaskDraft = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string
}

type DeadlineState =
  | 'overdue'
  | 'due-soon'
  | 'upcoming'
  | 'no-deadline'
  | 'completed'

type ApplicationTasksProps = {
  applicationId: string
  applicationDeadline?: string | null
  documentsReady?: boolean
}

const statusOptions: {
  value: TaskStatus
  label: string
}[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

const priorityOptions: {
  value: TaskPriority
  label: string
}[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

const emptyDraft: TaskDraft = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  due_date: '',
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('timeout')) {
      return 'The request took too long. Please try again.'
    }
  }

  return fallback
}

/**
 * Convert a date-only value into a local calendar date.
 * This also supports ISO timestamps.
 */
function parseLocalDate(date: string): Date {
  const datePart = date.slice(0, 10)
  const [year, month, day] = datePart.split('-').map(Number)

  if (
    !year ||
    !month ||
    !day ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return new Date(NaN)
  }

  const parsed = new Date(year, month - 1, day)

  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return new Date(NaN)
  }

  return parsed
}

function getToday(): Date {
  const today = new Date()

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
}

function getDateDifference(date: string): number {
  const parsedDate = parseLocalDate(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 0
  }

  const targetDate = parsedDate.getTime()
  const today = getToday().getTime()

  return Math.round(
    (targetDate - today) / (1000 * 60 * 60 * 24),
  )
}

function getDeadlineState(
  task: ApplicationTask,
): DeadlineState {
  if (task.status === 'completed') {
    return 'completed'
  }

  if (!task.due_date) {
    return 'no-deadline'
  }

  const difference = getDateDifference(task.due_date)

  if (difference < 0) {
    return 'overdue'
  }

  if (difference <= 7) {
    return 'due-soon'
  }

  return 'upcoming'
}

function getDeadlineLabel(task: ApplicationTask): string {
  const state = getDeadlineState(task)

  if (state === 'completed') {
    return 'Completed'
  }

  if (state === 'no-deadline') {
    return 'No deadline'
  }

  if (state === 'overdue') {
    const days = Math.abs(getDateDifference(task.due_date!))

    return `Overdue by ${days} day${days === 1 ? '' : 's'}`
  }

  if (state === 'due-soon') {
    const days = getDateDifference(task.due_date!)

    if (days === 0) return 'Due today'
    if (days === 1) return 'Due tomorrow'

    return `Due in ${days} days`
  }

  return 'Upcoming'
}

function getDeadlineStyle(state: DeadlineState): string {
  switch (state) {
    case 'overdue':
      return 'bg-red-500/10 text-red-700 dark:text-red-400'

    case 'due-soon':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'

    case 'upcoming':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'

    case 'completed':
      return 'bg-green-500/10 text-green-700 dark:text-green-400'

    case 'no-deadline':
      return 'bg-muted text-muted-foreground'
  }
}

function getPriorityStyle(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'bg-red-500/10 text-red-700 dark:text-red-400'

    case 'medium':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400'

    case 'low':
      return 'bg-green-500/10 text-green-700 dark:text-green-400'
  }
}

function getStatusStyle(status: TaskStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-500/10 text-green-700 dark:text-green-400'

    case 'in_progress':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'

    case 'todo':
      return 'bg-muted text-muted-foreground'
  }
}

function isOverdue(task: ApplicationTask): boolean {
  return getDeadlineState(task) === 'overdue'
}

function formatDate(date: string): string {
  const parsedDate = parseLocalDate(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Invalid date'
  }

  return parsedDate.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getReadiness(
  progress: number,
  totalTasks: number,
  documentsReady: boolean,
) {
  if (totalTasks === 0) {
    return {
      label: 'Not Started',
      description: 'Add tasks to start preparing your application.',
      style: 'bg-muted text-muted-foreground',
    }
  }

  if (progress === 100 && documentsReady) {
    return {
      label: 'Ready to Submit',
      description:
        'All preparation tasks and required documents are complete.',
      style: 'bg-green-500/10 text-green-700 dark:text-green-400',
    }
  }

  if (progress === 100) {
    return {
      label: 'Tasks Completed',
      description:
        'All tasks are complete. Make sure your required documents are ready before submitting.',
      style: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    }
  }

  if (progress >= 60) {
    return {
      label: 'Almost Ready',
      description:
        'You are close to completing your preparation tasks.',
      style: 'bg-green-500/10 text-green-700 dark:text-green-400',
    }
  }

  if (progress >= 25) {
    return {
      label: 'In Progress',
      description:
        'Your application preparation is progressing.',
      style: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
    }
  }

  return {
    label: 'Getting Started',
    description:
      'Keep completing your tasks to move closer to application readiness.',
    style: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  }
}

function getApplicationDeadlineInfo(
  deadline: string | null | undefined,
) {
  if (!deadline) {
    return {
      label: 'No deadline',
      description: 'No application deadline has been provided.',
      style: 'text-muted-foreground',
    }
  }

  const difference = getDateDifference(deadline)

  if (difference < 0) {
    const days = Math.abs(difference)

    return {
      label: `Deadline passed ${days} day${days === 1 ? '' : 's'} ago`,
      description: formatDate(deadline),
      style: 'text-red-700 dark:text-red-400',
    }
  }

  if (difference === 0) {
    return {
      label: 'Deadline is today',
      description: formatDate(deadline),
      style: 'text-red-700 dark:text-red-400',
    }
  }

  if (difference === 1) {
    return {
      label: '1 day remaining',
      description: formatDate(deadline),
      style: 'text-amber-700 dark:text-amber-400',
    }
  }

  return {
    label: `${difference} days remaining`,
    description: formatDate(deadline),
    style:
      difference <= 7
        ? 'text-amber-700 dark:text-amber-400'
        : 'text-blue-700 dark:text-blue-400',
  }
}

/**
 * Sort active tasks by nearest deadline.
 * Tasks without deadlines come after dated tasks.
 * Completed tasks are placed at the end.
 */
function sortTasks(tasks: ApplicationTask[]) {
  return [...tasks].sort((a, b) => {
    const aCompleted = a.status === 'completed'
    const bCompleted = b.status === 'completed'

    if (aCompleted !== bCompleted) {
      return aCompleted ? 1 : -1
    }

    if (a.due_date && b.due_date) {
      return a.due_date.localeCompare(b.due_date)
    }

    if (a.due_date && !b.due_date) {
      return -1
    }

    if (!a.due_date && b.due_date) {
      return 1
    }

    return (
      a.sort_order - b.sort_order ||
      a.created_at.localeCompare(b.created_at)
    )
  })
}

export function ApplicationTasks({
  applicationId,
  applicationDeadline = null,
  documentsReady = false,
}: ApplicationTasksProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [tasks, setTasks] = useState<ApplicationTask[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingTaskId, setSavingTaskId] = useState<string | null>(
    null,
  )

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const [newTask, setNewTask] = useState<TaskDraft>({
    ...emptyDraft,
  })

  const [editingTaskId, setEditingTaskId] = useState<string | null>(
    null,
  )

  const [editDraft, setEditDraft] = useState<TaskDraft>({
    ...emptyDraft,
  })

  const sortedTasks = useMemo(
    () => sortTasks(tasks),
    [tasks],
  )

  const completedCount = tasks.filter(
    (task) => task.status === 'completed',
  ).length

  const inProgressCount = tasks.filter(
    (task) => task.status === 'in_progress',
  ).length

  const remainingCount = tasks.length - completedCount

  const overdueCount = tasks.filter(isOverdue).length

  const dueSoonCount = tasks.filter(
    (task) => getDeadlineState(task) === 'due-soon',
  ).length

  const upcomingCount = tasks.filter(
    (task) => getDeadlineState(task) === 'upcoming',
  ).length

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100)

  const readiness = getReadiness(
    progress,
    tasks.length,
    documentsReady,
  )

  const deadlineInfo = getApplicationDeadlineInfo(
    applicationDeadline,
  )

  const nextTask = sortedTasks.find(
    (task) => task.status !== 'completed',
  )

  /**
   * Load tasks belonging to the current user and application.
   */
  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Please sign in to view your tasks.')
        setTasks([])
        return
      }

      const { data, error: queryError } = await supabase
        .from('application_tasks')
        .select('*')
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (queryError) {
        console.error(
          'Application tasks loading error:',
          queryError,
        )

        setError('Could not load your tasks. Please try again.')
        setTasks([])
        return
      }

      setTasks((data ?? []) as ApplicationTask[])
    } catch (err) {
      console.error(
        'Unexpected application tasks loading error:',
        err,
      )

      setError(
        getErrorMessage(
          err,
          'Something went wrong while loading your tasks.',
        ),
      )
      setTasks([])
    } finally {
      setLoading(false)
    }
  }, [applicationId, supabase])

  useEffect(() => {
    void loadTasks()
  }, [loadTasks])

  /**
   * Add a new task.
   */
  const addTask = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const title = newTask.title.trim()

    if (!title) {
      setError('Please enter a task title.')
      return
    }

    if (saving || loading) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Please sign in again to add a task.')
        return
      }

      const nextSortOrder =
        tasks.reduce(
          (maximum, task) =>
            Math.max(maximum, task.sort_order ?? 0),
          0,
        ) + 1

      const { data, error: insertError } = await supabase
        .from('application_tasks')
        .insert({
          application_id: applicationId,
          user_id: user.id,
          title,
          description: newTask.description.trim() || null,
          status: newTask.status,
          priority: newTask.priority,
          due_date: newTask.due_date || null,
          sort_order: nextSortOrder,
        })
        .select()
        .single()

      if (insertError || !data) {
        console.error(
          'Application task insert error:',
          insertError,
        )

        setError('Could not add this task. Please try again.')
        return
      }

      setTasks((previous) => [
        ...previous,
        data as ApplicationTask,
      ])

      setNewTask({ ...emptyDraft })
      setMessage('Task added successfully.')

      router.refresh()
    } catch (err) {
      console.error(
        'Unexpected application task insert error:',
        err,
      )

      setError(
        getErrorMessage(
          err,
          'Something went wrong while adding this task.',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  /**
   * Start editing a task.
   */
  const startEditing = (task: ApplicationTask) => {
    setEditingTaskId(task.id)

    setEditDraft({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ?? '',
    })

    setError('')
    setMessage('')
  }

  /**
   * Cancel editing.
   */
  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditDraft({ ...emptyDraft })
  }

  /**
   * Save task changes.
   * Includes detailed Supabase diagnostics if the update fails.
   */
  const saveTask = async (
    event: FormEvent<HTMLFormElement>,
    taskId: string,
  ) => {
    event.preventDefault()

    const title = editDraft.title.trim()

    if (!title) {
      setError('Task title cannot be empty.')
      return
    }

    if (savingTaskId) return

    setSavingTaskId(taskId)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error(
          'Task update authentication error:',
          authError,
        )

        setError(`Authentication failed: ${authError.message}`)
        return
      }

      if (!user) {
        setError('Please sign in again to update this task.')
        return
      }

      const updatePayload = {
        title,
        description: editDraft.description.trim() || null,
        status: editDraft.status,
        priority: editDraft.priority,
        due_date: editDraft.due_date || null,
      }

      const {
        data,
        error: updateError,
      } = await supabase
        .from('application_tasks')
        .update(updatePayload)
        .eq('id', taskId)
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle()

      if (updateError) {
        console.error(
          'Application task update diagnostic:',
          {
            taskId,
            applicationId,
            userId: user.id,
            payload: updatePayload,
            code: updateError.code,
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
          },
        )

        setError(
          `Update failed: ${updateError.message} (Code: ${
            updateError.code || 'Unknown'
          })`,
        )

        return
      }

      if (!data) {
        console.error(
          'Application task update returned no rows:',
          {
            taskId,
            applicationId,
            userId: user.id,
          },
        )

        setError(
          'The task was not updated. No matching task was returned. Check the task ID, ownership, and Supabase Row Level Security policies.',
        )

        return
      }

      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId ? (data as ApplicationTask) : task,
        ),
      )

      setEditingTaskId(null)
      setEditDraft({ ...emptyDraft })
      setMessage('Task updated successfully.')

      router.refresh()
    } catch (err) {
      console.error(
        'Unexpected application task update error:',
        err,
      )

      setError(
        getErrorMessage(
          err,
          'Something went wrong while updating this task.',
        ),
      )
    } finally {
      setSavingTaskId(null)
    }
  }

  /**
   * Update task status without opening the edit form.
   */
  const updateTaskStatus = async (
    taskId: string,
    status: TaskStatus,
  ) => {
    if (savingTaskId) return

    setSavingTaskId(taskId)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Please sign in again to update this task.')
        return
      }

      const { data, error: updateError } = await supabase
        .from('application_tasks')
        .update({ status })
        .eq('id', taskId)
        .eq('application_id', applicationId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError || !data) {
        console.error(
          'Task status update error:',
          updateError,
        )

        setError('Could not update task status. Please try again.')
        return
      }

      setTasks((previous) =>
        previous.map((task) =>
          task.id === taskId ? (data as ApplicationTask) : task,
        ),
      )

      setMessage('Task status updated.')

      router.refresh()
    } catch (err) {
      console.error(
        'Unexpected task status update error:',
        err,
      )

      setError(
        getErrorMessage(
          err,
          'Something went wrong while updating task status.',
        ),
      )
    } finally {
      setSavingTaskId(null)
    }
  }

  /**
   * Delete a task owned by the current user.
   */
  const deleteTask = async (taskId: string) => {
    if (savingTaskId) return

    const confirmed = window.confirm(
      'Are you sure you want to delete this task?',
    )

    if (!confirmed) return

    setSavingTaskId(taskId)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        setError('Please sign in again to delete this task.')
        return
      }

      const { error: deleteError } = await supabase
        .from('application_tasks')
        .delete()
        .eq('id', taskId)
        .eq('application_id', applicationId)
        .eq('user_id', user.id)

      if (deleteError) {
        console.error(
          'Application task delete error:',
          deleteError,
        )

        setError('Could not delete this task. Please try again.')
        return
      }

      setTasks((previous) =>
        previous.filter((task) => task.id !== taskId),
      )

      if (editingTaskId === taskId) {
        cancelEditing()
      }

      setMessage('Task deleted successfully.')

      router.refresh()
    } catch (err) {
      console.error(
        'Unexpected application task delete error:',
        err,
      )

      setError(
        getErrorMessage(
          err,
          'Something went wrong while deleting this task.',
        ),
      )
    } finally {
      setSavingTaskId(null)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      {/* Header */}

      <div>
        <h3 className="text-lg font-semibold">
          Application Tasks
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">
          Organize the steps you need to complete before applying.
        </p>
      </div>

      {/* Application Progress Overview */}

      <div className="mt-6 rounded-2xl border border-border bg-muted/30 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h4 className="font-semibold">
              Task Progress Overview
            </h4>

            <p className="mt-1 text-sm text-muted-foreground">
              Track your tasks and see what needs your attention.
            </p>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${readiness.style}`}
          >
            {loading ? 'Loading...' : readiness.label}
          </span>
        </div>

        {/* Main task progress */}

        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-medium">
              Task completion
            </span>

            <span className="text-lg font-bold">
              {loading ? '—' : `${progress}%`}
            </span>
          </div>

          <div
            className="h-3 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Task completion"
            aria-valuenow={loading ? 0 : progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${loading ? 0 : progress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {loading
              ? 'Loading your task progress...'
              : readiness.description}
          </p>
        </div>

        {/* Task overview cards */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              Total tasks
            </p>

            <p className="mt-1 text-2xl font-bold">
              {loading ? '—' : tasks.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              Completed tasks
            </p>

            <p className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">
              {loading ? '—' : completedCount}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              Remaining tasks
            </p>

            <p className="mt-1 text-2xl font-bold">
              {loading ? '—' : remainingCount}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs text-muted-foreground">
              In progress
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700 dark:text-blue-400">
              {loading ? '—' : inProgressCount}
            </p>
          </div>
        </div>

        {/* Next task and application deadline */}

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">
              NEXT TASK
            </p>

            {loading ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Loading your tasks...
              </p>
            ) : nextTask ? (
              <>
                <p className="mt-2 font-semibold">
                  {nextTask.title}
                </p>

                {nextTask.due_date ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Due {formatDate(nextTask.due_date)}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    No due date assigned
                  </p>
                )}

                <span
                  className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityStyle(nextTask.priority)}`}
                >
                  {nextTask.priority.charAt(0).toUpperCase() +
                    nextTask.priority.slice(1)}{' '}
                  priority
                </span>
              </>
            ) : (
              <p className="mt-2 text-sm font-medium text-green-700 dark:text-green-400">
                All tasks completed. Great work!
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground">
              APPLICATION DEADLINE
            </p>

            <p
              className={`mt-2 text-lg font-bold ${deadlineInfo.style}`}
            >
              {deadlineInfo.label}
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {deadlineInfo.description}
            </p>
          </div>
        </div>
      </div>

      {/* Deadline summary */}

      <div className="mt-5">
        <h4 className="mb-3 text-sm font-semibold">
          Task deadline summary
        </h4>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400">
            {loading ? '—' : upcomingCount} upcoming
          </span>

          <span className="rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            {loading ? '—' : dueSoonCount} due soon
          </span>

          <span className="rounded-full bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-400">
            {loading ? '—' : overdueCount} overdue
          </span>
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Task completion is tracked separately from your document checklist.
        </p>
      </div>

      {/* Tasks */}

      <div className="mt-7">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">
            Your tasks
          </h4>

          <span className="text-xs text-muted-foreground">
            Sorted by nearest deadline
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            Loading your tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-10 text-center">
            <p className="font-medium">No tasks yet</p>

            <p className="mt-1 text-sm text-muted-foreground">
              Start by adding the steps you need to complete for this application.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => {
              const deadlineState = getDeadlineState(task)
              const isEditing = editingTaskId === task.id
              const taskSaving = savingTaskId === task.id

              return (
                <div
                  key={task.id}
                  className="rounded-xl border border-border p-4"
                >
                  {isEditing ? (
                    <form
                      onSubmit={(event) =>
                        void saveTask(event, task.id)
                      }
                      className="space-y-4"
                    >
                      <div className="grid gap-2">
                        <label
                          htmlFor={`edit-title-${task.id}`}
                          className="text-sm font-medium"
                        >
                          Task title
                        </label>

                        <input
                          id={`edit-title-${task.id}`}
                          type="text"
                          value={editDraft.title}
                          onChange={(event) =>
                            setEditDraft((previous) => ({
                              ...previous,
                              title: event.target.value,
                            }))
                          }
                          maxLength={150}
                          required
                          disabled={taskSaving}
                          className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div className="grid gap-2">
                        <label
                          htmlFor={`edit-description-${task.id}`}
                          className="text-sm font-medium"
                        >
                          Description
                        </label>

                        <textarea
                          id={`edit-description-${task.id}`}
                          value={editDraft.description}
                          onChange={(event) =>
                            setEditDraft((previous) => ({
                              ...previous,
                              description: event.target.value,
                            }))
                          }
                          rows={3}
                          disabled={taskSaving}
                          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="grid gap-2">
                          <label
                            htmlFor={`edit-status-${task.id}`}
                            className="text-sm font-medium"
                          >
                            Status
                          </label>

                          <select
                            id={`edit-status-${task.id}`}
                            value={editDraft.status}
                            onChange={(event) =>
                              setEditDraft((previous) => ({
                                ...previous,
                                status: event.target.value as TaskStatus,
                              }))
                            }
                            disabled={taskSaving}
                            className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm"
                          >
                            {statusOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-2">
                          <label
                            htmlFor={`edit-priority-${task.id}`}
                            className="text-sm font-medium"
                          >
                            Priority
                          </label>

                          <select
                            id={`edit-priority-${task.id}`}
                            value={editDraft.priority}
                            onChange={(event) =>
                              setEditDraft((previous) => ({
                                ...previous,
                                priority: event.target.value as TaskPriority,
                              }))
                            }
                            disabled={taskSaving}
                            className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm"
                          >
                            {priorityOptions.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid gap-2">
                          <label
                            htmlFor={`edit-date-${task.id}`}
                            className="text-sm font-medium"
                          >
                            Due date
                          </label>

                          <input
                            id={`edit-date-${task.id}`}
                            type="date"
                            value={editDraft.due_date}
                            onChange={(event) =>
                              setEditDraft((previous) => ({
                                ...previous,
                                due_date: event.target.value,
                              }))
                            }
                            disabled={taskSaving}
                            className="min-h-11 min-w-0 w-full rounded-lg border border-input bg-background px-3 text-sm"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Your manually selected date will be saved and will not be replaced by a page refresh.
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={
                            taskSaving || !editDraft.title.trim()
                          }
                          className="min-h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
                        >
                          {taskSaving ? 'Saving...' : 'Save changes'}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={taskSaving}
                          className="min-h-10 rounded-lg border border-border px-4 text-sm font-medium disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <h5
                            className={`font-semibold ${
                              task.status === 'completed'
                                ? 'text-muted-foreground line-through'
                                : ''
                            }`}
                          >
                            {task.title}
                          </h5>

                          {task.description && (
                            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                              {task.description}
                            </p>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityStyle(task.priority)}`}
                            >
                              {task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)}{' '}
                              priority
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(task.status)}`}
                            >
                              {
                                statusOptions.find(
                                  (option) =>
                                    option.value === task.status,
                                )?.label
                              }
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getDeadlineStyle(deadlineState)}`}
                            >
                              {getDeadlineLabel(task)}
                            </span>
                          </div>

                          {task.due_date && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Due date: {formatDate(task.due_date)}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => startEditing(task)}
                            disabled={Boolean(savingTaskId)}
                            className="min-h-10 rounded-lg border border-border px-3 text-sm font-medium transition hover:bg-muted disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteTask(task.id)}
                            disabled={Boolean(savingTaskId)}
                            className="min-h-10 rounded-lg border border-border px-3 text-sm font-medium text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
                          >
                            {taskSaving ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <label
                          htmlFor={`quick-status-${task.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Update status
                        </label>

                        <select
                          id={`quick-status-${task.id}`}
                          value={task.status}
                          disabled={Boolean(savingTaskId)}
                          onChange={(event) =>
                            void updateTaskStatus(
                              task.id,
                              event.target.value as TaskStatus,
                            )
                          }
                          className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm disabled:opacity-50 sm:w-44"
                        >
                          {statusOptions.map((option) => (
                            <option
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add task */}

      <div className="mt-8 border-t border-border pt-6">
        <h4 className="text-sm font-semibold">
          Add a new task
        </h4>

        <p className="mt-1 text-sm text-muted-foreground">
          Add a step you need to complete for this application.
        </p>

        <form
          onSubmit={addTask}
          className="mt-4 space-y-4"
        >
          <div className="grid gap-2">
            <label
              htmlFor={`new-task-title-${applicationId}`}
              className="text-sm font-medium"
            >
              Task title
            </label>

            <input
              id={`new-task-title-${applicationId}`}
              type="text"
              value={newTask.title}
              onChange={(event) =>
                setNewTask((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              placeholder="e.g. Prepare my CV"
              maxLength={150}
              required
              disabled={saving || loading}
              className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor={`new-task-description-${applicationId}`}
              className="text-sm font-medium"
            >
              Description{' '}
              <span className="text-muted-foreground">(optional)</span>
            </label>

            <textarea
              id={`new-task-description-${applicationId}`}
              value={newTask.description}
              onChange={(event) =>
                setNewTask((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              placeholder="Add more details about this task..."
              rows={3}
              disabled={saving || loading}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <label
                htmlFor={`new-task-priority-${applicationId}`}
                className="text-sm font-medium"
              >
                Priority
              </label>

              <select
                id={`new-task-priority-${applicationId}`}
                value={newTask.priority}
                onChange={(event) =>
                  setNewTask((previous) => ({
                    ...previous,
                    priority: event.target.value as TaskPriority,
                  }))
                }
                disabled={saving || loading}
                className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {priorityOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor={`new-task-status-${applicationId}`}
                className="text-sm font-medium"
              >
                Status
              </label>

              <select
                id={`new-task-status-${applicationId}`}
                value={newTask.status}
                onChange={(event) =>
                  setNewTask((previous) => ({
                    ...previous,
                    status: event.target.value as TaskStatus,
                  }))
                }
                disabled={saving || loading}
                className="min-h-11 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {statusOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <label
                htmlFor={`new-task-date-${applicationId}`}
                className="text-sm font-medium"
              >
                Due date
              </label>

              <input
                id={`new-task-date-${applicationId}`}
                type="date"
                value={newTask.due_date}
                onChange={(event) =>
                  setNewTask((previous) => ({
                    ...previous,
                    due_date: event.target.value,
                  }))
                }
                disabled={saving || loading}
                className="min-h-11 min-w-0 w-full rounded-lg border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={
              saving || loading || !newTask.title.trim()
            }
            className="min-h-11 w-full rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? 'Adding task...' : '+ Add task'}
          </button>
        </form>
      </div>

      {/* Feedback */}

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {message && !error && (
        <p
          role="status"
          aria-live="polite"
          className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm"
        >
          {message}
        </p>
      )}
    </section>
  )
}