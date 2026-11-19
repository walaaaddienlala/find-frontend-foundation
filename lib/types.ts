export const opportunityTypes = [
  'internship',
  'scholarship',
  'fellowship',
  'graduate-program',
  'competition',
  // Types the admin form can already create (app/admin/opportunities/page.tsx).
  // Spec categories not yet creatable (research, exchange, summer school, jobs,
  // entrepreneurship, grants, ...) are PENDING and map to 'other' until added.
  'volunteering',
  'conference',
  'workshop',
  'other',
] as const

export type OpportunityType = (typeof opportunityTypes)[number]

export type WorkMode = 'remote' | 'hybrid' | 'on-site' | 'unspecified'

export type FundingType =
  | 'fully_funded'
  | 'partially_funded'
  | 'unfunded'
  | 'no_fee'
  | 'unspecified'

export type DeadlineStatus = 'open' | 'closing-soon' | 'closed'

export type Opportunity = {
  id: string
  title: string
  organization: string
  type: OpportunityType

  country: string
  location: string

  workMode: WorkMode
  fundingType: FundingType

  deadline: string
  programStartDate: string
  programEndDate: string

  createdAt: string
  publishedAt: string

  summary: string
  description: string

  eligibility: string[]
  requirements: string[]
  academicRequirements: string[]
  skillsRequirements: string[]
  requiredDocuments: string[]

  tags: string[]

  applicationUrl: string
  officialSourceUrl: string
  contactInformation: string
}

export type ApplicationStatus =
  | 'saved'
  | 'preparing'
  | 'submitted'
  | 'interview'
  | 'offer'
  | 'closed'

export type ReadinessLevel =
  | 'ready'
  | 'almost'
  | 'building'
  | 'not-assessed'