'use client'

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from 'react'

import {
  Activity,
  CalendarDays,
  ExternalLink,
  FileText,
  Loader2,
  Link2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react'

import {
  updateApplicationAction,
  saveApplicationNotes,
  saveApplicationDeadline,
  getApplicationLinks,
  addApplicationLink,
  updateApplicationLink,
  deleteApplicationLink,
  getApplicationActivity,
  type ApplicationActionState,
  type ApplicationLink,
  type ApplicationActivity,
} from '@/app/applications/actions'

import { Button } from '@/components/ui/button'
import { isStatusSelectable } from '@/lib/applications/transitions'
import { ApplicationChecklist } from '@/components/applications/application-checklist'
import { ApplicationTasks } from '@/components/applications/application-tasks'

const initialState: ApplicationActionState = {
  success: false,
  message: '',
}

const statusOptions = [
  { value: 'saved', label: 'Saved' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'interview', label: 'Interview' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'waitlisted', label: 'Waitlisted' },
] as const

type ApplicationManagerProps = {
  applicationId: string
  currentStatus: string

  // Official opportunity deadline.
  deadline: string | null

  // User-defined personal application deadline.
  personalDeadline: string | null

  notes?: string | null
}

function formatActivityDate(date: string) {
  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate)
}

/**
 * Converts a database timestamp into YYYY-MM-DD for a date input.
 * The personal deadline is stored at 23:59:59 UTC, so using the
 * UTC date portion preserves the originally selected calendar day.
 */
function toDateInputValue(value: string | null): string {
  if (!value) return ''

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toISOString().slice(0, 10)
}

function formatDeadline(value: string | null) {
  if (!value) return 'No personal deadline set'

  const dateValue = toDateInputValue(value)

  if (!dateValue) return 'Date unavailable'

  const [year, month, day] = dateValue.split('-').map(Number)

  const date = new Date(year, month - 1, day)

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(date)
}

export function ApplicationManager({
  applicationId,
  currentStatus,
  deadline,
  personalDeadline,
  notes,
}: ApplicationManagerProps) {
  const [state, formAction, pending] = useActionState(
    updateApplicationAction,
    initialState,
  )

  const formRef = useRef<HTMLFormElement>(null)

  const [documentsReady, setDocumentsReady] = useState(false)

  // Application Notes
  const [noteValue, setNoteValue] = useState<string>(notes ?? '')
  const [notesPending, setNotesPending] = useState(false)
  const [notesMessage, setNotesMessage] = useState('')
  const [notesError, setNotesError] = useState(false)

  // Personal Application Deadline
  const [personalDeadlineValue, setPersonalDeadlineValue] = useState(
    toDateInputValue(personalDeadline),
  )
  const [deadlinePending, setDeadlinePending] = useState(false)
  const [deadlineMessage, setDeadlineMessage] = useState('')
  const [deadlineError, setDeadlineError] = useState(false)

  // Important Links
  const [links, setLinks] = useState<ApplicationLink[]>([])
  const [linksLoading, setLinksLoading] = useState(true)
  const [linkPending, setLinkPending] = useState(false)
  const [linkMessage, setLinkMessage] = useState('')
  const [linkError, setLinkError] = useState(false)

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [showLinkForm, setShowLinkForm] = useState(false)

  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [linkDescription, setLinkDescription] = useState('')

  // Application Activity
  const [activity, setActivity] = useState<ApplicationActivity[]>([])
  const [activityLoading, setActivityLoading] = useState(true)
  const [activityError, setActivityError] = useState('')

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset()
    }
  }, [state])

  // Keep the personal deadline synchronized if the server provides
  // a refreshed value after navigation or revalidation.
  useEffect(() => {
    setPersonalDeadlineValue(toDateInputValue(personalDeadline))
  }, [personalDeadline])

  /* ---------------------------------------------------------------------- */
  /*                         LOAD APPLICATION DATA                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    let active = true

    async function loadApplicationData() {
      setLinksLoading(true)
      setActivityLoading(true)
      setLinkError(false)
      setActivityError('')
      setLinkMessage('')

      try {
        const results = await Promise.allSettled([
          getApplicationLinks(applicationId),
          getApplicationActivity(applicationId),
        ])

        if (!active) return

        const [linksResult, activityResult] = results

        // Handle Important Links independently.
        if (linksResult.status === 'fulfilled') {
          if (linksResult.value.success) {
            setLinks(linksResult.value.data ?? [])
            setLinkError(false)
          } else {
            setLinks([])
            setLinkError(true)
            setLinkMessage(
              linksResult.value.message ?? 'Could not load links.',
            )
          }
        } else {
          console.error(
            'Unexpected error loading application links:',
            linksResult.reason,
          )

          setLinks([])
          setLinkError(true)
          setLinkMessage(
            'An unexpected error occurred while loading links.',
          )
        }

        // Handle Application Activity independently.
        if (activityResult.status === 'fulfilled') {
          if (activityResult.value.success) {
            setActivity(activityResult.value.data ?? [])
            setActivityError('')
          } else {
            setActivity([])
            setActivityError(
              activityResult.value.message ??
                'Could not load activity history.',
            )
          }
        } else {
          console.error(
            'Unexpected error loading application activity:',
            activityResult.reason,
          )

          setActivity([])
          setActivityError(
            'An unexpected error occurred while loading activity.',
          )
        }
      } catch (error) {
        console.error('Unexpected application data loading error:', error)

        if (!active) return

        setLinkError(true)
        setLinkMessage('Could not load application links.')

        setActivityError('Could not load application activity.')
      } finally {
        if (active) {
          setLinksLoading(false)
          setActivityLoading(false)
        }
      }
    }

    loadApplicationData()

    return () => {
      active = false
    }
  }, [applicationId])

  /* ---------------------------------------------------------------------- */
  /*                              NOTES                                     */
  /* ---------------------------------------------------------------------- */

  async function handleSaveNotes() {
    setNotesPending(true)
    setNotesMessage('')
    setNotesError(false)

    try {
      const result = await saveApplicationNotes(
        applicationId,
        noteValue,
      )

      setNotesMessage(result.message)
      setNotesError(!result.success)

      if (result.success) {
        await refreshActivity()
      }
    } catch (error) {
      console.error('Error saving application notes:', error)

      setNotesMessage('Something went wrong while saving your notes.')
      setNotesError(true)
    } finally {
      setNotesPending(false)
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                    PERSONAL APPLICATION DEADLINE                       */
  /* ---------------------------------------------------------------------- */

  async function handleSavePersonalDeadline() {
    setDeadlinePending(true)
    setDeadlineMessage('')
    setDeadlineError(false)

    try {
      const result = await saveApplicationDeadline(
        applicationId,
        personalDeadlineValue || null,
      )

      setDeadlineMessage(result.message)
      setDeadlineError(!result.success)

      if (result.success) {
        await refreshActivity()
      }
    } catch (error) {
      console.error('Error saving personal application deadline:', error)

      setDeadlineMessage(
        'Something went wrong while saving your personal deadline.',
      )
      setDeadlineError(true)
    } finally {
      setDeadlinePending(false)
    }
  }

  async function handleClearPersonalDeadline() {
    if (!personalDeadlineValue) return

    setDeadlinePending(true)
    setDeadlineMessage('')
    setDeadlineError(false)

    try {
      const result = await saveApplicationDeadline(
        applicationId,
        null,
      )

      setDeadlineMessage(result.message)
      setDeadlineError(!result.success)

      if (result.success) {
        setPersonalDeadlineValue('')
        await refreshActivity()
      }
    } catch (error) {
      console.error('Error clearing personal application deadline:', error)

      setDeadlineMessage(
        'Something went wrong while clearing your personal deadline.',
      )
      setDeadlineError(true)
    } finally {
      setDeadlinePending(false)
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                           IMPORTANT LINKS                              */
  /* ---------------------------------------------------------------------- */

  function resetLinkForm() {
    setLinkLabel('')
    setLinkUrl('')
    setLinkDescription('')
    setEditingLinkId(null)
    setShowLinkForm(false)
  }

  function startEditingLink(link: ApplicationLink) {
    setEditingLinkId(link.id)
    setLinkLabel(link.label)
    setLinkUrl(link.url)
    setLinkDescription(link.description ?? '')
    setShowLinkForm(true)
    setLinkMessage('')
    setLinkError(false)
  }

  async function handleLinkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setLinkPending(true)
    setLinkMessage('')
    setLinkError(false)

    try {
      const input = {
        applicationId,
        label: linkLabel,
        url: linkUrl,
        description: linkDescription,
      }

      const result = editingLinkId
        ? await updateApplicationLink({
            ...input,
            linkId: editingLinkId,
          })
        : await addApplicationLink(input)

      setLinkMessage(result.message)
      setLinkError(!result.success)

      if (result.success) {
        resetLinkForm()

        await Promise.all([
          refreshLinks(),
          refreshActivity(),
        ])
      }
    } catch (error) {
      console.error('Error saving application link:', error)

      setLinkMessage('Something went wrong while saving this link.')
      setLinkError(true)
    } finally {
      setLinkPending(false)
    }
  }

  async function handleDeleteLink(linkId: string) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this link?',
    )

    if (!confirmed) return

    setLinkPending(true)
    setLinkMessage('')
    setLinkError(false)

    try {
      const result = await deleteApplicationLink(
        applicationId,
        linkId,
      )

      setLinkMessage(result.message)
      setLinkError(!result.success)

      if (result.success) {
        await Promise.all([
          refreshLinks(),
          refreshActivity(),
        ])
      }
    } catch (error) {
      console.error('Error deleting application link:', error)

      setLinkMessage('Something went wrong while deleting this link.')
      setLinkError(true)
    } finally {
      setLinkPending(false)
    }
  }

  async function refreshLinks() {
    try {
      const result = await getApplicationLinks(applicationId)

      if (result.success) {
        setLinks(result.data ?? [])
        setLinkError(false)
        return
      }

      setLinkError(true)
      setLinkMessage(result.message ?? 'Could not refresh links.')
    } catch (error) {
      console.error('Error refreshing application links:', error)

      setLinkError(true)
      setLinkMessage('Something went wrong while refreshing links.')
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                         APPLICATION ACTIVITY                           */
  /* ---------------------------------------------------------------------- */

  async function refreshActivity() {
    try {
      const result = await getApplicationActivity(applicationId)

      if (result.success) {
        setActivity(result.data ?? [])
        setActivityError('')
        return
      }

      setActivityError(
        result.message ?? 'Could not refresh activity history.',
      )
    } catch (error) {
      console.error('Error refreshing application activity:', error)

      setActivityError(
        'Something went wrong while refreshing activity history.',
      )
    }
  }

  /* ---------------------------------------------------------------------- */
  /*                                RENDER                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="mt-5 space-y-5">

      {/* Application Status */}

      <section className="rounded-xl border border-border bg-muted/30 p-4">
        <h4 className="text-sm font-semibold">
          Manage Application
        </h4>

        <p className="mt-1 text-xs text-muted-foreground">
          Update your application stage. Preparation progress is
          calculated automatically from your checklist.
        </p>

        <form
          ref={formRef}
          action={formAction}
          className="mt-4 grid gap-4"
        >
          <input
            type="hidden"
            name="applicationId"
            value={applicationId}
          />

          <div className="grid gap-2">
            <label
              htmlFor={`status-${applicationId}`}
              className="text-sm font-medium"
            >
              Application Status
            </label>

            <select
              id={`status-${applicationId}`}
              name="status"
              defaultValue={currentStatus}
              disabled={pending}
              className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statusOptions
                .filter((option) =>
                  isStatusSelectable(currentStatus, option.value),
                )
                .map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            disabled={pending}
            className="w-full"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Status
              </>
            )}
          </Button>

          {state.message && (
            <p
              role="status"
              aria-live="polite"
              className={`text-sm ${
                state.success
                  ? 'text-green-700'
                  : 'text-destructive'
              }`}
            >
              {state.message}
            </p>
          )}
        </form>
      </section>

      {/* Personal Application Deadline */}

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-muted-foreground" />

          <h4 className="text-sm font-semibold">
            Personal Application Deadline
          </h4>
        </div>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Set your own target date for completing this application.
          This is separate from the official opportunity deadline.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Current personal deadline
          </p>

          <p className="mt-1 text-sm font-medium">
            {formatDeadline(personalDeadlineValue || null)}
          </p>
        </div>

        <div className="mt-4 grid gap-2">
          <label
            htmlFor={`personal-deadline-${applicationId}`}
            className="text-sm font-medium"
          >
            Choose your target date
          </label>

          <input
            id={`personal-deadline-${applicationId}`}
            type="date"
            value={personalDeadlineValue}
            onChange={(event) => {
              setPersonalDeadlineValue(event.target.value)
              setDeadlineMessage('')
              setDeadlineError(false)
            }}
            disabled={deadlinePending}
            className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={handleSavePersonalDeadline}
            disabled={
              deadlinePending ||
              !personalDeadlineValue
            }
            className="w-full sm:w-auto"
          >
            {deadlinePending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Personal Deadline
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleClearPersonalDeadline}
            disabled={
              deadlinePending ||
              !personalDeadlineValue
            }
            className="w-full sm:w-auto"
          >
            {deadlinePending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <X className="mr-2 size-4" />
            )}
            Clear Deadline
          </Button>
        </div>

        {deadlineMessage && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${
              deadlineError
                ? 'text-destructive'
                : 'text-green-700'
            }`}
          >
            {deadlineMessage}
          </p>
        )}
      </section>

      {/* Application Notes */}

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground" />

          <h4 className="text-sm font-semibold">
            Application Notes
          </h4>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          Keep your personal notes, reminders, and important details
          about this application.
        </p>

        <textarea
          value={noteValue}
          onChange={(event) => {
            setNoteValue(event.target.value)
            setNotesMessage('')
          }}
          rows={5}
          maxLength={10000}
          placeholder="Write your application notes here..."
          className="mt-4 w-full resize-y rounded-lg border border-input bg-background p-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            {noteValue.length}/10000 characters
          </span>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveNotes}
            disabled={notesPending}
          >
            {notesPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Notes
              </>
            )}
          </Button>
        </div>

        {notesMessage && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${
              notesError ? 'text-destructive' : 'text-green-700'
            }`}
          >
            {notesMessage}
          </p>
        )}
      </section>

      {/* Important Links */}

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link2 className="size-4 text-muted-foreground" />

              <h4 className="text-sm font-semibold">
                Important Links
              </h4>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Save application portals, official websites, and
              confirmation links.
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              resetLinkForm()
              setShowLinkForm(true)
            }}
          >
            <Plus className="mr-2 size-4" />
            Add Link
          </Button>
        </div>

        {showLinkForm && (
          <form
            onSubmit={handleLinkSubmit}
            className="mt-4 space-y-3 rounded-lg border border-border bg-muted/20 p-3"
          >
            <div className="grid gap-2">
              <label
                htmlFor={`link-label-${applicationId}`}
                className="text-sm font-medium"
              >
                Link Name
              </label>

              <input
                id={`link-label-${applicationId}`}
                value={linkLabel}
                onChange={(event) => setLinkLabel(event.target.value)}
                required
                maxLength={100}
                placeholder="e.g. Application Portal"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor={`link-url-${applicationId}`}
                className="text-sm font-medium"
              >
                URL
              </label>

              <input
                id={`link-url-${applicationId}`}
                type="url"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.target.value)}
                required
                placeholder="https://example.com"
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid gap-2">
              <label
                htmlFor={`link-description-${applicationId}`}
                className="text-sm font-medium"
              >
                Description (optional)
              </label>

              <textarea
                id={`link-description-${applicationId}`}
                value={linkDescription}
                onChange={(event) =>
                  setLinkDescription(event.target.value)
                }
                rows={2}
                maxLength={500}
                placeholder="Add a short description..."
                className="resize-y rounded-lg border border-input bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="submit"
                size="sm"
                disabled={linkPending}
              >
                {linkPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Save className="mr-2 size-4" />
                )}

                {editingLinkId ? 'Update Link' : 'Save Link'}
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={resetLinkForm}
                disabled={linkPending}
              >
                <X className="mr-2 size-4" />
                Cancel
              </Button>
            </div>
          </form>
        )}

        {linkMessage && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${
              linkError ? 'text-destructive' : 'text-green-700'
            }`}
          >
            {linkMessage}
          </p>
        )}

        {linksLoading ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading links...
          </div>
        ) : linkError ? (
          <p className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {linkMessage || 'Could not load important links.'}
          </p>
        ) : links.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No important links saved yet.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-primary hover:underline"
                  >
                    <span className="truncate">{link.label}</span>
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>

                  {link.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {link.description}
                    </p>
                  )}

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {link.url}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${link.label}`}
                    onClick={() => startEditingLink(link)}
                  >
                    <Pencil className="size-4" />
                  </Button>

                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete ${link.label}`}
                    disabled={linkPending}
                    onClick={() => handleDeleteLink(link.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Documents Checklist */}

      <ApplicationChecklist
        applicationId={applicationId}
        onReadinessChange={setDocumentsReady}
      />

      {/* Application Tasks */}

      <ApplicationTasks
        applicationId={applicationId}
        applicationDeadline={deadline}
        documentsReady={documentsReady}
      />

      {/* Application Activity History */}

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-muted-foreground" />

          <h4 className="text-sm font-semibold">
            Application Activity
          </h4>
        </div>

        <p className="mt-1 text-xs text-muted-foreground">
          A history of changes and updates made to this application.
        </p>

        {activityLoading ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading activity...
          </div>
        ) : activityError ? (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {activityError}
          </p>
        ) : activity.length === 0 ? (
          <p className="mt-5 rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No activity recorded yet.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {activity.map((item) => (
              <div
                key={item.id}
                className="relative border-l-2 border-border pb-1 pl-4 last:border-transparent"
              >
                <span className="absolute -left-[5px] top-1 size-2 rounded-full bg-primary" />

                <p className="text-sm font-medium">
                  {item.title}
                </p>

                {item.description && (
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.description}
                  </p>
                )}

                <time
                  dateTime={item.created_at}
                  className="mt-2 block text-xs text-muted-foreground"
                >
                  {formatActivityDate(item.created_at)}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}