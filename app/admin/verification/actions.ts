'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

const VERIFICATION_PATH = '/admin/verification'
const MAX_REVIEW_NOTES_LENGTH = 5000

async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be signed in to perform this action.')
  }

  const { data: isAdmin, error: roleError } = await supabase.rpc(
    'has_role',
    { requested_role: 'admin' },
  )

  if (roleError || isAdmin !== true) {
    throw new Error('You are not authorized to verify opportunities.')
  }

  return supabase
}

function getOpportunityId(formData: FormData) {
  const id = formData.get('opportunity_id')
  const value = typeof id === 'string' ? id.trim() : ''

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new Error('Invalid opportunity ID.')
  }

  return value
}

function isRpcSuccess(data: unknown): boolean {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { success?: unknown }).success === true
  )
}

function isValidFutureDate(dateValue: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return false
  }

  const parsedDate = new Date(`${dateValue}T23:59:59.000Z`)

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== dateValue
  ) {
    return false
  }

  return parsedDate.getTime() > Date.now()
}

function logVerificationError(
  operation: string,
  error: unknown,
) {
  const errorCode =
    error &&
    typeof error === 'object' &&
    'code' in error
      ? String(error.code)
      : 'RPC_UNEXPECTED_RESPONSE'

  console.error(`[admin/verification] ${operation} failed`, {
    errorCode,
  })
}

export async function submitOpportunityForReview(
  formData: FormData,
) {
  const supabase = await requireAdmin()
  const opportunityId = getOpportunityId(formData)

  const { data, error } = await supabase.rpc(
    'submit_opportunity_for_review',
    {
      p_opportunity_id: opportunityId,
    },
  )

  if (error || !isRpcSuccess(data)) {
    logVerificationError(
      'submitOpportunityForReview',
      error,
    )

    redirect(
      `${VERIFICATION_PATH}?error=${encodeURIComponent(
        'Could not submit this opportunity for review. Please try again or contact an administrator.',
      )}`,
    )
  }

  revalidatePath(VERIFICATION_PATH)
  revalidatePath('/admin/opportunities')

  redirect(
    `${VERIFICATION_PATH}?success=${encodeURIComponent(
      'Opportunity submitted for review.',
    )}`,
  )
}

export async function verifyOpportunity(
  formData: FormData,
) {
  const supabase = await requireAdmin()
  const opportunityId = getOpportunityId(formData)

  const notesValue = formData.get('review_notes')

  const reviewNotes =
    typeof notesValue === 'string'
      ? notesValue.trim()
      : ''

  const nextReviewValue = formData.get('next_review_at')

  const nextReviewDate =
    typeof nextReviewValue === 'string'
      ? nextReviewValue.trim()
      : ''

  if (!reviewNotes) {
    redirect(
      `${VERIFICATION_PATH}?error=${encodeURIComponent(
        'Review notes are required before verification.',
      )}`,
    )
  }

  if (
    Array.from(reviewNotes).length >
    MAX_REVIEW_NOTES_LENGTH
  ) {
    redirect(
      `${VERIFICATION_PATH}?error=${encodeURIComponent(
        `Review notes must not exceed ${MAX_REVIEW_NOTES_LENGTH} characters.`,
      )}`,
    )
  }

  let nextReviewAt: string | null = null

  if (nextReviewDate) {
    if (!isValidFutureDate(nextReviewDate)) {
      redirect(
        `${VERIFICATION_PATH}?error=${encodeURIComponent(
          'Please enter a valid future review date.',
        )}`,
      )
    }

    nextReviewAt = new Date(
      `${nextReviewDate}T23:59:59.000Z`,
    ).toISOString()
  }

  const { data, error } = await supabase.rpc(
    'verify_opportunity',
    {
      p_opportunity_id: opportunityId,
      p_review_notes: reviewNotes,
      p_next_review_at: nextReviewAt,
    },
  )

  if (error || !isRpcSuccess(data)) {
    logVerificationError(
      'verifyOpportunity',
      error,
    )

    redirect(
      `${VERIFICATION_PATH}?error=${encodeURIComponent(
        'Could not verify this opportunity. Please check its review status and try again.',
      )}`,
    )
  }

  revalidatePath(VERIFICATION_PATH)
  revalidatePath('/admin/opportunities')
  revalidatePath('/opportunities')

  redirect(
    `${VERIFICATION_PATH}?success=${encodeURIComponent(
      'Opportunity verified. It remains unpublished until separately published.',
    )}`,
  )
}