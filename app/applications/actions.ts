'use server'

import { revalidatePath } from 'next/cache'
import { validateTransition } from '@/lib/applications/transitions'
import { createClient } from '@/lib/supabase/server'

const allowedStatuses = [
  'saved',
  'preparing',
  'in_progress',
  'submitted',
  'interview',
  'accepted',
  'rejected',
  'waitlisted',
] as const

export type ApplicationActionState = {
  success: boolean
  message: string
}

export type ApplicationLink = {
  id: string
  application_id: string
  user_id: string
  label: string
  url: string
  description: string | null
  created_at: string
  updated_at: string
}

export type ApplicationActivity = {
  id: string
  application_id: string
  user_id: string
  event_type: string
  title: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
}

function normalizeUrl(value: string) {
  const trimmed = value.trim()

  if (!trimmed) return null

  try {
    const parsed = new URL(
      /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(trimmed)
        ? trimmed
        : `https://${trimmed}`,
    )

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

async function getAuthenticatedUser() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return { supabase, user: null }
  }

  return { supabase, user }
}

async function verifyApplicationOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  applicationId: string,
  userId: string,
) {
  const { data, error } = await supabase
    .from('applications')
    .select('id')
    .eq('id', applicationId)
    .eq('user_id', userId)
    .maybeSingle()

  return !error && !!data
}

/* -------------------------------------------------------------------------- */
/*                           APPLICATION STATUS                              */
/* -------------------------------------------------------------------------- */

export async function updateApplicationAction(
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const applicationId = String(formData.get('applicationId') ?? '')
  const status = String(formData.get('status') ?? '')

  if (!applicationId) {
    return {
      success: false,
      message: 'Application ID is required.',
    }
  }

  if (!allowedStatuses.includes(status as (typeof allowedStatuses)[number])) {
    return {
      success: false,
      message: 'Invalid application status.',
    }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return {
      success: false,
      message: 'You must be logged in.',
    }
  }

  const { data: current, error: currentError } = await supabase
    .from('applications')
    .select('status')
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (currentError || !current) {
    return {
      success: false,
      message: 'Could not update your application.',
    }
  }

  const transition = validateTransition(String(current.status), status)

  if (!transition.ok) {
    return {
      success: false,
      message: transition.message,
    }
  }

  // Optimistic concurrency: only update if the status is still the one we validated.
  const { data, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .eq('status', current.status)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('updateApplicationAction:', error)

    return {
      success: false,
      message: 'Could not update your application.',
    }
  }

  revalidatePath('/applications')
  revalidatePath('/saved')

  return {
    success: true,
    message: 'Application updated successfully.',
  }
}

/* -------------------------------------------------------------------------- */
/*                       PERSONAL APPLICATION DEADLINE                       */
/* -------------------------------------------------------------------------- */

function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)

  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

export async function saveApplicationDeadline(
  applicationId: string,
  deadline: string | null,
): Promise<ApplicationActionState> {
  if (!applicationId) {
    return {
      success: false,
      message: 'Application ID is required.',
    }
  }

  if (
    deadline !== null &&
    (typeof deadline !== 'string' || !isValidDateString(deadline))
  ) {
    return {
      success: false,
      message: 'Please provide a valid deadline date.',
    }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return {
      success: false,
      message: 'You must be logged in.',
    }
  }

  const ownsApplication = await verifyApplicationOwnership(
    supabase,
    applicationId,
    user.id,
  )

  if (!ownsApplication) {
    return {
      success: false,
      message: 'Application not found.',
    }
  }

  // Store the selected calendar day as the end of that day in UTC.
  // This keeps the chosen date intact when reading it back.
  const deadlineTimestamp = deadline
    ? `${deadline}T23:59:59.000Z`
    : null

  const { data, error } = await supabase
    .from('applications')
    .update({
      application_deadline: deadlineTimestamp,
    })
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('saveApplicationDeadline:', error)

    return {
      success: false,
      message: 'Could not save your personal deadline.',
    }
  }

  revalidatePath('/applications')

  return {
    success: true,
    message: deadline
      ? 'Personal deadline saved successfully.'
      : 'Personal deadline cleared successfully.',
  }
}

/* -------------------------------------------------------------------------- */
/*                            APPLICATION NOTES                              */
/* -------------------------------------------------------------------------- */

export async function saveApplicationNotes(
  applicationId: string,
  notes: string,
): Promise<ApplicationActionState> {
  if (!applicationId) {
    return {
      success: false,
      message: 'Application ID is required.',
    }
  }

  if (typeof notes !== 'string' || notes.length > 10000) {
    return {
      success: false,
      message: 'Notes must be under 10,000 characters.',
    }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return {
      success: false,
      message: 'You must be logged in.',
    }
  }

  const { data, error } = await supabase
    .from('applications')
    .update({
      notes: notes.trim() || null,
    })
    .eq('id', applicationId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('saveApplicationNotes:', error)

    return {
      success: false,
      message: 'Could not save your notes.',
    }
  }

  revalidatePath('/applications')

  return {
    success: true,
    message: 'Notes saved successfully.',
  }
}

/* -------------------------------------------------------------------------- */
/*                            APPLICATION LINKS                              */
/* -------------------------------------------------------------------------- */

export async function getApplicationLinks(
  applicationId: string,
): Promise<{
  success: boolean
  data: ApplicationLink[]
  message?: string
}> {
  if (!applicationId) {
    return {
      success: false,
      data: [],
      message: 'Application ID is required.',
    }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return {
      success: false,
      data: [],
      message: 'You must be logged in.',
    }
  }

  const ownsApplication = await verifyApplicationOwnership(
    supabase,
    applicationId,
    user.id,
  )

  if (!ownsApplication) {
    return {
      success: false,
      data: [],
      message: 'Application not found.',
    }
  }

  const { data, error } = await supabase
    .from('application_links')
    .select('*')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('getApplicationLinks:', error)

    return {
      success: false,
      data: [],
      message: 'Could not load links.',
    }
  }

  return {
    success: true,
    data: (data ?? []) as ApplicationLink[],
  }
}

export async function addApplicationLink(input: {
  applicationId: string
  label: string
  url: string
  description?: string
}): Promise<ApplicationActionState> {
  const label = input.label?.trim()
  const url = normalizeUrl(input.url ?? '')
  const description = input.description?.trim() || null

  if (!input.applicationId || !label || !url) {
    return {
      success: false,
      message: 'Please provide a valid label and URL.',
    }
  }

  if (label.length > 100 || (description && description.length > 500)) {
    return {
      success: false,
      message: 'Some fields exceed the allowed length.',
    }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return {
      success: false,
      message: 'You must be logged in.',
    }
  }

  const ownsApplication = await verifyApplicationOwnership(
    supabase,
    input.applicationId,
    user.id,
  )

  if (!ownsApplication) {
    return {
      success: false,
      message: 'Application not found.',
    }
  }

  const { error } = await supabase
    .from('application_links')
    .insert({
      application_id: input.applicationId,
      user_id: user.id,
      label,
      url,
      description,
    })

  if (error) {
    console.error('addApplicationLink:', error)

    return {
      success: false,
      message: 'Could not add this link.',
    }
  }

  revalidatePath('/applications')

  return {
    success: true,
    message: 'Link added successfully.',
  }
}

export async function updateApplicationLink(input: {
  applicationId: string
  linkId: string
  label: string
  url: string
  description?: string
}): Promise<ApplicationActionState> {
  const label = input.label?.trim()
  const url = normalizeUrl(input.url ?? '')
  const description = input.description?.trim() || null

  if (!input.applicationId || !input.linkId || !label || !url) {
    return {
      success: false,
      message: 'Please provide a valid label and URL.',
    }
  }

  if (label.length > 100 || (description && description.length > 500)) {
    return {
      success: false,
      message: 'Some fields exceed the allowed length.',
    }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return {
      success: false,
      message: 'You must be logged in.',
    }
  }

  const ownsApplication = await verifyApplicationOwnership(
    supabase,
    input.applicationId,
    user.id,
  )

  if (!ownsApplication) {
    return {
      success: false,
      message: 'Application not found.',
    }
  }

  const { data, error } = await supabase
    .from('application_links')
    .update({
      label,
      url,
      description,
    })
    .eq('id', input.linkId)
    .eq('application_id', input.applicationId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('updateApplicationLink:', error)

    return {
      success: false,
      message: 'Could not update this link.',
    }
  }

  revalidatePath('/applications')

  return {
    success: true,
    message: 'Link updated successfully.',
  }
}

export async function deleteApplicationLink(
  applicationId: string,
  linkId: string,
): Promise<ApplicationActionState> {
  if (!applicationId || !linkId) {
    return {
      success: false,
      message: 'Missing link information.',
    }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return {
      success: false,
      message: 'You must be logged in.',
    }
  }

  const { data, error } = await supabase
    .from('application_links')
    .delete()
    .eq('id', linkId)
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    console.error('deleteApplicationLink:', error)

    return {
      success: false,
      message: 'Could not delete this link.',
    }
  }

  revalidatePath('/applications')

  return {
    success: true,
    message: 'Link deleted successfully.',
  }
}

/* -------------------------------------------------------------------------- */
/*                         APPLICATION ACTIVITY                              */
/* -------------------------------------------------------------------------- */

export async function getApplicationActivity(
  applicationId: string,
): Promise<{
  success: boolean
  data: ApplicationActivity[]
  message?: string
}> {
  if (!applicationId) {
    return {
      success: false,
      data: [],
      message: 'Application ID is required.',
    }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return {
      success: false,
      data: [],
      message: 'You must be logged in.',
    }
  }

  const ownsApplication = await verifyApplicationOwnership(
    supabase,
    applicationId,
    user.id,
  )

  if (!ownsApplication) {
    return {
      success: false,
      data: [],
      message: 'Application not found.',
    }
  }

  const { data, error } = await supabase
    .from('application_activity')
    .select('*')
    .eq('application_id', applicationId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('getApplicationActivity:', error)

    return {
      success: false,
      data: [],
      message: 'Could not load activity.',
    }
  }

  return {
    success: true,
    data: (data ?? []) as ApplicationActivity[],
  }
}
/* -------------------------------------------------------------------------- */
/*                         START APPLICATION TRACKING                         */
/* -------------------------------------------------------------------------- */

export type StartApplicationResult = {
  success: boolean
  message: string
  applicationId?: string
  alreadyExists?: boolean
}

/**
 * Creates an application-tracking record for a published opportunity.
 * This is intentionally separate from bookmarking and never mutates an
 * existing application or a saved_opportunities row.
 */
export async function startApplicationAction(
  opportunityId: string,
): Promise<StartApplicationResult> {
  const normalizedId = typeof opportunityId === 'string' ? opportunityId.trim() : ''

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(normalizedId)) {
    return { success: false, message: 'A valid opportunity is required.' }
  }

  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return { success: false, message: 'Please sign in to track this application.' }
  }

  const { data: opportunity, error: opportunityError } = await supabase
    .from('opportunities')
    .select('id')
    .eq('id', normalizedId)
    .eq('status', 'published')
    .maybeSingle()

  if (opportunityError || !opportunity) {
    return { success: false, message: 'This opportunity is not currently available.' }
  }

  // The unique (user_id, opportunity_id) constraint makes this action
  // idempotent. Never reset the status of an existing application.
  const { data: existing, error: existingError } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', user.id)
    .eq('opportunity_id', normalizedId)
    .maybeSingle()

  if (existingError) {
    console.error('startApplicationAction lookup:', existingError)
    return { success: false, message: 'Could not check your application status.' }
  }

  if (existing) {
    revalidatePath('/applications')
    return {
      success: true,
      message: 'You are already tracking this application.',
      applicationId: existing.id,
      alreadyExists: true,
    }
  }

  const { data: created, error: insertError } = await supabase
    .from('applications')
    .insert({
      user_id: user.id,
      opportunity_id: normalizedId,
      status: 'preparing',
      preparation_progress: 0,
    })
    .select('id')
    .single()

  if (insertError || !created) {
    // A second tab/request may have won the unique-key race. Return that
    // existing record without changing its lifecycle state.
    const { data: raced } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('opportunity_id', normalizedId)
      .maybeSingle()

    if (raced) {
      revalidatePath('/applications')
      return {
        success: true,
        message: 'You are already tracking this application.',
        applicationId: raced.id,
        alreadyExists: true,
      }
    }

    console.error('startApplicationAction insert:', insertError)
    return { success: false, message: 'Could not start tracking this application.' }
  }

  revalidatePath('/applications')
  revalidatePath(`/opportunities/${normalizedId}`)

  return {
    success: true,
    message: 'Application tracking started. You can now prepare and track your progress.',
    applicationId: created.id,
    alreadyExists: false,
  }
}
