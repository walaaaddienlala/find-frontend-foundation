import { createClient } from '@/lib/supabase/server'
import { getOpportunities } from '@/lib/data/opportunities'
import type { Opportunity } from '@/lib/types'
import { createUnavailableOpportunity } from '@/lib/applications/opportunity-history'

export type ApplicationStatus =
  | 'saved'
  | 'preparing'
  | 'in_progress'
  | 'submitted'
  | 'interview'
  | 'accepted'
  | 'rejected'
  | 'waitlisted'

export type UserApplication = {
  id: string
  userId: string
  opportunityId: string
  status: ApplicationStatus
  notes: string | null
  appliedAt: string | null
  applicationDeadline: string | null
  preparationProgress: number
  createdAt: string
  updatedAt: string
  opportunity: Opportunity
  opportunityUnavailable: boolean
}

type ChecklistProgressItem = {
  application_id: string
  status: string
}

function calculateChecklistProgress(items: ChecklistProgressItem[]) {
  if (items.length === 0) return 0

  const completed = items.filter((item) => item.status === 'done').length
  return Math.round((completed / items.length) * 100)
}

export async function getSavedOpportunities(): Promise<Opportunity[]> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return []

  const { data, error } = await supabase
    .from('saved_opportunities')
    .select('opportunity_id')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching saved opportunities:', error)
    return []
  }

  const savedIds = new Set((data ?? []).map((item) => item.opportunity_id))
  if (savedIds.size === 0) return []

  const opportunities = await getOpportunities()

  return opportunities.filter((opportunity) => savedIds.has(opportunity.id))
}

export async function getUserApplications(): Promise<UserApplication[]> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return []

  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
    return []
  }

  const applicationRows = data ?? []
  if (applicationRows.length === 0) return []

  const applicationIds = applicationRows.map((application) => application.id)

  const { data: checklistItems, error: checklistError } = await supabase
    .from('application_checklist_items')
    .select('application_id, status')
    .in('application_id', applicationIds)
    .eq('user_id', user.id)

  if (checklistError) {
    console.error('Error fetching application checklist progress:', checklistError)
    throw new Error('Could not load application preparation progress.')
  }

  const checklistByApplication = new Map<string, ChecklistProgressItem[]>()

  for (const item of checklistItems ?? []) {
    const currentItems = checklistByApplication.get(item.application_id) ?? []
    currentItems.push(item)
    checklistByApplication.set(item.application_id, currentItems)
  }

  const opportunities = await getOpportunities()
  const opportunityMap = new Map(
    opportunities.map((opportunity) => [opportunity.id, opportunity]),
  )

  return applicationRows.map((application) => {
    const publishedOpportunity = opportunityMap.get(application.opportunity_id)
    const opportunityUnavailable = !publishedOpportunity
      // Keep the user's application history visible when the opportunity is
      // unpublished or archived. Public opportunity reads remain published-only.
    const opportunity: Opportunity =
      publishedOpportunity ??
      createUnavailableOpportunity(application.opportunity_id, application.created_at)

    const applicationChecklist = checklistByApplication.get(application.id) ?? []
    const preparationProgress = calculateChecklistProgress(applicationChecklist)

    return {
      id: application.id,
      userId: application.user_id,
      opportunityId: application.opportunity_id,
      status: application.status as ApplicationStatus,
      notes: application.notes,
      appliedAt: application.applied_at,
      applicationDeadline: application.application_deadline,
      preparationProgress,
      createdAt: application.created_at,
      updatedAt: application.updated_at,
      opportunity,
      opportunityUnavailable,
    }
  })
}
