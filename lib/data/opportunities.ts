import type { FundingType, Opportunity, OpportunityType } from '@/lib/types'

import { isSupabaseConfigured } from '@/lib/env'
import {
  normalizeFundingType,
  normalizeOpportunityType,
  normalizeWorkMode,
  toDatabaseOpportunityType,
} from '@/lib/opportunities/mappers'
import {
  clampPage,
  clampPageSize,
  sanitizeSearchTerm,
} from '@/lib/opportunities/search'
import { createClient } from '@/lib/supabase/server'

type OpportunityRow = {
  id: string
  title: string
  provider: string
  opportunity_type: string
  description: string

  eligibility: string | null
  academic_requirements: string | null
  skills_requirements: unknown
  required_documents: string[]

  country: string | null
  location: string | null

  delivery_mode: string
  funding_type: string

  deadline: string | null
  program_start_date: string | null
  program_end_date: string | null

  tags: string[]

  application_url: string
  official_source_url: string
  contact_information: string | null

  created_at: string
  published_at: string | null
}

/**
 * Explicit column list (replaces select('*')). Compile-time checked against
 * OpportunityRow so a typo fails typecheck instead of breaking the public site.
 * Internal columns (created_by, verification fields, ...) are deliberately not
 * fetched by public reads.
 */
const OPPORTUNITY_COLUMNS = [
  'id',
  'title',
  'provider',
  'opportunity_type',
  'description',
  'eligibility',
  'academic_requirements',
  'skills_requirements',
  'required_documents',
  'country',
  'location',
  'delivery_mode',
  'funding_type',
  'deadline',
  'program_start_date',
  'program_end_date',
  'tags',
  'application_url',
  'official_source_url',
  'contact_information',
  'created_at',
  'published_at',
] as const satisfies readonly (keyof OpportunityRow)[]

const OPPORTUNITY_SELECT = OPPORTUNITY_COLUMNS.join(',')

function toList(value: string | null): string[] {
  if (!value) return []

  return value
    .split(/\n|•|;/)
    .map((item) => item.replace(/^[-\s]+/, '').trim())
    .filter(Boolean)
}

function getSkills(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.filter(
    (item): item is string => typeof item === 'string',
  )
}

function getSummary(description: string): string {
  const cleaned = description.trim()

  if (cleaned.length <= 180) return cleaned

  return `${cleaned.slice(0, 177).trimEnd()}...`
}

function mapOpportunity(row: OpportunityRow): Opportunity {
  const skillsRequirements = getSkills(row.skills_requirements)

  const academicRequirements = toList(row.academic_requirements)

  const requiredDocuments = row.required_documents ?? []

  const requirements = [
    ...academicRequirements,
    ...skillsRequirements,
    ...requiredDocuments,
  ]

  return {
    id: row.id,
    title: row.title,
    organization: row.provider,
    type: normalizeOpportunityType(row.opportunity_type),

    country: row.country?.trim() || 'Not specified',
    location: row.location?.trim() || 'Not specified',

    workMode: normalizeWorkMode(row.delivery_mode),
    fundingType: normalizeFundingType(row.funding_type),

    deadline: row.deadline ? row.deadline.slice(0, 10) : '',
    programStartDate: row.program_start_date ?? '',
    programEndDate: row.program_end_date ?? '',

    createdAt: row.created_at,
    publishedAt: row.published_at ?? row.created_at,

    summary: getSummary(row.description),
    description: row.description,

    eligibility: toList(row.eligibility),
    requirements,
    academicRequirements,
    skillsRequirements,
    requiredDocuments,

    tags: row.tags ?? [],

    applicationUrl: row.application_url,
    officialSourceUrl: row.official_source_url,
    contactInformation: row.contact_information ?? '',
  }
}

export async function getOpportunities(): Promise<Opportunity[]> {
  if (!isSupabaseConfigured()) {
    console.error('Error fetching opportunities: Supabase is not configured.')
    return []
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('opportunities')
    .select(OPPORTUNITY_SELECT)
    .eq('status', 'published')
    .order('deadline', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching opportunities:', error.message)
    return []
  }

  return (data as unknown as OpportunityRow[]).map(mapOpportunity)
}

export async function getOpportunityById(
  id: string,
): Promise<Opportunity | undefined> {
  if (!isSupabaseConfigured()) return undefined

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('opportunities')
    .select(OPPORTUNITY_SELECT)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.error('Error fetching opportunity:', error.message)
    return undefined
  }

  if (!data) return undefined

  return mapOpportunity(data as unknown as OpportunityRow)
}

export type OpportunityPageQuery = {
  page?: number
  pageSize?: number
  query?: string
  type?: OpportunityType
  country?: string
  funding?: FundingType
}

export type OpportunityPage = {
  items: Opportunity[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  /** false when the data source could not be reached (render an error state, not an empty one). */
  ok: boolean
}

/**
 * Server-side paginated + filtered read of PUBLISHED opportunities.
 * IMPLEMENTED (core hardening) and used by /compare. The public browser
 * (components/opportunities/opportunity-browser.tsx) still filters client-side;
 * switching it to this function is PENDING (see docs/FIND_IMPLEMENTATION_GUIDE.md).
 */
export async function getOpportunitiesPage(
  options: OpportunityPageQuery = {},
): Promise<OpportunityPage> {
  const page = clampPage(options.page)
  const pageSize = clampPageSize(options.pageSize)
  const empty: OpportunityPage = {
    items: [],
    total: 0,
    page,
    pageSize,
    pageCount: 0,
    ok: false,
  }

  if (!isSupabaseConfigured()) return empty

  const supabase = await createClient()
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let request = supabase
    .from('opportunities')
    .select(OPPORTUNITY_SELECT, { count: 'exact' })
    .eq('status', 'published')

  const term = sanitizeSearchTerm(options.query)
  if (term) {
    request = request.or(
      `title.ilike.%${term}%,provider.ilike.%${term}%`,
    )
  }
  if (options.type) {
    request = request.eq('opportunity_type', toDatabaseOpportunityType(options.type))
  }
  if (options.country?.trim()) {
    request = request.eq('country', options.country.trim())
  }
  if (options.funding) {
    request = request.eq('funding_type', options.funding)
  }

  const { data, error, count } = await request
    .order('deadline', { ascending: true, nullsFirst: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching opportunity page:', error.message)
    return empty
  }

  const total = count ?? 0

  return {
    items: (data as unknown as OpportunityRow[]).map(mapOpportunity),
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize),
    ok: true,
  }
}

export const isUsingSampleData = false