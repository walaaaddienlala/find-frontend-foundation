export const opportunityTypes = [
  'internship',
  'scholarship',
  'fellowship',
  'graduate-program',
  'competition',
] as const

export type OpportunityType = (typeof opportunityTypes)[number]

export type WorkMode = 'remote' | 'hybrid' | 'on-site'

export type Opportunity = {
  id: string
  title: string
  organization: string
  type: OpportunityType
  location: string
  workMode: WorkMode
  deadline: string
  summary: string
  description: string
  eligibility: string[]
  requirements: string[]
  tags: string[]
}

export type ApplicationStatus =
  | 'saved'
  | 'preparing'
  | 'submitted'
  | 'interview'
  | 'offer'
  | 'closed'

export type ReadinessLevel = 'ready' | 'almost' | 'building' | 'not-assessed'
