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

type ChecklistStatus = 'missing' | 'in_progress' | 'done'

type ChecklistItem = {
  id: string
  application_id: string
  user_id: string
  document_name: string
  status: ChecklistStatus
  notes: string | null
  sort_order: number
  created_at: string
}

type ApplicationChecklistProps = {
  applicationId: string
  onReadinessChange: (ready: boolean) => void
}

const REQUEST_TIMEOUT = 15000

const statusOptions: {
  value: ChecklistStatus
  label: string
}[] = [
  { value: 'missing', label: 'Missing' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

async function withTimeout<T>(
  request: PromiseLike<T>,
  operation: string,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  try {
    return await Promise.race([
      Promise.resolve(request),
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(
            new Error(
              `${operation} timed out after ${REQUEST_TIMEOUT / 1000} seconds.`,
            ),
          )
        }, REQUEST_TIMEOUT)
      }),
    ])
  } finally {
    if (timeoutId) clearTimeout(timeoutId)
  }
}

function calculateProgress(items: ChecklistItem[]) {
  if (items.length === 0) return 0

  const completed = items.filter(
    (item) => item.status === 'done',
  ).length

  return Math.round((completed / items.length) * 100)
}

function calculateReadiness(items: ChecklistItem[]) {
  return (
    items.length > 0 &&
    items.every((item) => item.status === 'done')
  )
}

function getNextSortOrder(items: ChecklistItem[]) {
  if (items.length === 0) return 1

  return Math.max(...items.map((item) => item.sort_order)) + 1
}

export function ApplicationChecklist({
  applicationId,
  onReadinessChange,
}: ApplicationChecklistProps) {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()

  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newDocument, setNewDocument] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const completedCount = items.filter(
    (item) => item.status === 'done',
  ).length

  const progress = calculateProgress(items)

  useEffect(() => {
    if (!loading) {
      onReadinessChange(calculateReadiness(items))
    }
  }, [items, loading, onReadinessChange])

  const loadChecklist = useCallback(async () => {
    setLoading(true)
    setError('')
    setMessage('')
    onReadinessChange(false)

    try {
      console.info('[Checklist] Starting authentication...')

      const {
        data: { user },
        error: authError,
      } = await withTimeout(
        supabase.auth.getUser(),
        'Checklist authentication',
      )

      if (authError) {
        throw authError
      }

      if (!user) {
        throw new Error('No authenticated user found.')
      }

      console.info(
        '[Checklist] Authentication successful. Loading items...',
      )

      const { data, error: queryError } = await withTimeout(
        supabase
          .from('application_checklist_items')
          .select('*')
          .eq('application_id', applicationId)
          .eq('user_id', user.id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true }),
        'Checklist database query',
      )

      if (queryError) {
        throw queryError
      }

      setItems((data ?? []) as ChecklistItem[])

      console.info(
        `[Checklist] Successfully loaded ${data?.length ?? 0} items.`,
      )
    } catch (err) {
      console.error('[Checklist] Loading failed:', err)

      setItems([])

      setError(
        err instanceof Error &&
          err.message.includes('timed out')
          ? 'Loading your checklist timed out. Please check your connection and try again.'
          : 'Could not load your checklist. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [applicationId, supabase, onReadinessChange])

  useEffect(() => {
    void loadChecklist()
  }, [loadChecklist])


  const updateItemStatus = async (
    itemId: string,
    status: ChecklistStatus,
  ) => {
    if (saving || loading) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
        error: authError,
      } = await withTimeout(
        supabase.auth.getUser(),
        'Checklist update authentication',
      )

      if (authError) throw authError
      if (!user) throw new Error('No authenticated user found.')

      const { data, error: updateError } = await withTimeout(
        supabase
          .from('application_checklist_items')
          .update({ status })
          .eq('id', itemId)
          .eq('application_id', applicationId)
          .eq('user_id', user.id)
          .select()
          .single(),
        'Checklist item update',
      )

      if (updateError) throw updateError
      if (!data) throw new Error('Updated checklist item was not returned.')

      const updatedItems = items.map((item) =>
        item.id === itemId ? (data as ChecklistItem) : item,
      )

      setItems(updatedItems)

      setMessage('Document status updated successfully.')
      router.refresh()
    } catch (err) {
      console.error('[Checklist] Status update failed:', err)
      setError('Could not update this document. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const addDocument = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const documentName = newDocument.trim()

    if (!documentName) {
      setError('Please enter a document name.')
      return
    }

    if (
      items.some(
        (item) =>
          item.document_name.trim().toLowerCase() ===
          documentName.toLowerCase(),
      )
    ) {
      setError('This document already exists in your checklist.')
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
      } = await withTimeout(
        supabase.auth.getUser(),
        'Checklist insert authentication',
      )

      if (authError) throw authError
      if (!user) throw new Error('No authenticated user found.')

      const { data, error: insertError } = await withTimeout(
        supabase
          .from('application_checklist_items')
          .insert({
            application_id: applicationId,
            user_id: user.id,
            document_name: documentName,
            status: 'missing',
            sort_order: getNextSortOrder(items),
          })
          .select()
          .single(),
        'Checklist document insert',
      )

      if (insertError) throw insertError
      if (!data) throw new Error('Inserted document was not returned.')

      const updatedItems = [...items, data as ChecklistItem]

      setItems(updatedItems)
      setNewDocument('')

      setMessage('Document added successfully.')
      router.refresh()
    } catch (err) {
      console.error('[Checklist] Add document failed:', err)
      setError('Could not add this document. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const deleteDocument = async (itemId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to remove this document?',
    )

    if (!confirmed || saving || loading) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      const {
        data: { user },
        error: authError,
      } = await withTimeout(
        supabase.auth.getUser(),
        'Checklist delete authentication',
      )

      if (authError) throw authError
      if (!user) throw new Error('No authenticated user found.')

      const { error: deleteError } = await withTimeout(
        supabase
          .from('application_checklist_items')
          .delete()
          .eq('id', itemId)
          .eq('application_id', applicationId)
          .eq('user_id', user.id),
        'Checklist document delete',
      )

      if (deleteError) throw deleteError

      const updatedItems = items.filter(
        (item) => item.id !== itemId,
      )

      setItems(updatedItems)

      setMessage('Document removed successfully.')
      router.refresh()
    } catch (err) {
      console.error('[Checklist] Delete document failed:', err)
      setError('Could not remove this document. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Application Checklist
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Keep track of the documents you need for this opportunity.
          </p>
        </div>

        <div className="rounded-xl bg-muted px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Documents completed
          </p>

          <p className="mt-1 text-xl font-semibold">
            {loading ? '—' : `${completedCount}/${items.length}`}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Preparation progress</span>
          <span className="font-semibold">
            {loading ? '—' : `${progress}%`}
          </span>
        </div>

        <div
          className="h-2.5 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Checklist completion"
          aria-valuenow={loading ? 0 : progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${loading ? 0 : progress}%` }}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-muted-foreground">
          Loading your checklist...
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium">
                  {item.document_name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {item.status === 'done'
                    ? 'Document completed'
                    : item.status === 'in_progress'
                      ? 'Currently preparing this document'
                      : 'This document is not ready yet'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={item.status}
                  disabled={saving}
                  onChange={(event) =>
                    void updateItemStatus(
                      item.id,
                      event.target.value as ChecklistStatus,
                    )
                  }
                  aria-label={`Status for ${item.document_name}`}
                  className="min-h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 sm:w-36"
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

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void deleteDocument(item.id)}
                  className="min-h-11 rounded-lg border border-border px-3 text-sm text-muted-foreground transition hover:border-destructive hover:text-destructive disabled:opacity-50"
                  aria-label={`Remove ${item.document_name}`}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
              <p className="font-medium">No documents yet</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Add the documents you need for this application.
              </p>
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={addDocument}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="text"
          value={newDocument}
          onChange={(event) => setNewDocument(event.target.value)}
          placeholder="Add a custom document..."
          maxLength={120}
          disabled={saving || loading}
          className="min-h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        <button
          type="submit"
          disabled={saving || loading || !newDocument.trim()}
          className="min-h-11 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Add document'}
        </button>
      </form>

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