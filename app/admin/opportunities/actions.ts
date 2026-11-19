'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { normalizeHttpUrl } from '@/lib/validation/url'

type DeliveryMode = 'remote' | 'in_person' | 'hybrid' | 'unspecified'

type FundingType =
  | 'fully_funded'
  | 'partially_funded'
  | 'unfunded'
  | 'no_fee'
  | 'unspecified'

async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('You must be signed in.')
  }

  const { data: isAdmin, error: roleError } = await supabase.rpc(
    'has_role',
    {
      requested_role: 'admin',
    },
  )

  if (roleError || isAdmin !== true) {
    throw new Error('You are not authorized to manage opportunities.')
  }

  return { supabase, user }
}

function getText(formData: FormData, key: string): string {
  const value = formData.get(key)

  return typeof value === 'string' ? value.trim() : ''
}

function getOptionalText(formData: FormData, key: string): string | null {
  return getText(formData, key) || null
}

function getList(formData: FormData, key: string): string[] {
  return getText(formData, key)
    .split(/\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function getDate(
  formData: FormData,
  key: string,
  includeTime = false,
): string | null {
  const value = getText(formData, key)

  if (!value) return null

  const date = new Date(
    includeTime && value.length === 16
      ? `${value}:00`
      : value,
  )

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date in ${key}.`)
  }

  return includeTime ? date.toISOString() : value
}

function getOpportunityData(formData: FormData) {
  const title = getText(formData, 'title')
  const provider = getText(formData, 'provider')
  const opportunityType = getText(formData, 'opportunity_type')
  const description = getText(formData, 'description')
  const applicationUrl = getText(formData, 'application_url')
  const officialSourceUrl = getText(formData, 'official_source_url')

  if (
    !title ||
    !provider ||
    !opportunityType ||
    !description ||
    !applicationUrl ||
    !officialSourceUrl
  ) {
    throw new Error('Please complete all required fields.')
  }

  const safeApplicationUrl = normalizeHttpUrl(applicationUrl)
  const safeOfficialSourceUrl = normalizeHttpUrl(officialSourceUrl)

  if (!safeApplicationUrl || !safeOfficialSourceUrl) {
    throw new Error('Please enter valid http(s) URLs.')
  }

  const deliveryMode = getText(formData, 'delivery_mode') as DeliveryMode
  const fundingType = getText(formData, 'funding_type') as FundingType
  const allowedDeliveryModes: DeliveryMode[] = [
    'remote',
    'in_person',
    'hybrid',
    'unspecified',
  ]

  const allowedFundingTypes: FundingType[] = [
    'fully_funded',
    'partially_funded',
    'unfunded',
    'no_fee',
    'unspecified',
  ]

  const programStartDate = getDate(formData, 'program_start_date')
  const programEndDate = getDate(formData, 'program_end_date')

  if (
    programStartDate &&
    programEndDate &&
    programEndDate < programStartDate
  ) {
    throw new Error('Program end date cannot be before its start date.')
  }

  return {
    title,
    provider,
    opportunity_type: opportunityType,
    description,
    eligibility: getOptionalText(formData, 'eligibility'),
    academic_requirements: getOptionalText(
      formData,
      'academic_requirements',
    ),
    skills_requirements: getList(formData, 'skills_requirements'),
    required_documents: getList(formData, 'required_documents'),
    country: getOptionalText(formData, 'country'),
    location: getOptionalText(formData, 'location'),
    delivery_mode: deliveryMode,
    funding_type: fundingType,
    deadline: getDate(formData, 'deadline', true),
    program_start_date: programStartDate,
    program_end_date: programEndDate,
    application_url: safeApplicationUrl,
    official_source_url: safeOfficialSourceUrl,
    contact_information: getOptionalText(
      formData,
      'contact_information',
    ),
    tags: getList(formData, 'tags'),
  }
}

export async function createOpportunity(formData: FormData) {
  const { supabase, user } = await requireAdmin()

  const opportunityData = getOpportunityData(formData)

  const { error } = await supabase.from('opportunities').insert({
    ...opportunityData,
    created_by: user.id,
    status: 'draft',
    verification_status: 'unverified',
    published_at: null,
  })

  if (error) {
    throw new Error(`Could not create opportunity: ${error.message}`)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/opportunities')
  revalidatePath('/opportunities')
}

export async function updateOpportunity(formData: FormData) {
  const { supabase } = await requireAdmin()

  const id = getText(formData, 'id')

  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      id,
    )
  ) {
    throw new Error('Invalid opportunity ID.')
  }

  const opportunityData = getOpportunityData(formData)

  const { data: existingOpportunity, error: existingError } =
    await supabase
      .from('opportunities')
      .select('id')
      .eq('id', id)
      .maybeSingle()

  if (existingError || !existingOpportunity) {
    throw new Error('Opportunity not found.')
  }

  // Content edits must never change publication or verification state.
  // Those transitions are handled by the dedicated, audited workflow.
  const { error } = await supabase
    .from('opportunities')
    .update(opportunityData)
    .eq('id', id)

  if (error) {
    throw new Error(`Could not update opportunity: ${error.message}`)
  }

  revalidatePath('/admin')
  revalidatePath('/admin/opportunities')
  revalidatePath('/opportunities')
}