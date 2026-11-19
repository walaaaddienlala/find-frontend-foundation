import type { Opportunity } from '../types'

/**
 * Minimal owner-facing placeholder used when an application references an
 * opportunity that is no longer available through the public published-only
 * query. It intentionally contains no stale external application URLs.
 */
export function createUnavailableOpportunity(
  opportunityId: string,
  createdAt: string,
): Opportunity {
  return {
    id: opportunityId,
    title: 'Opportunity no longer publicly available',
    organization: 'Organization information unavailable',
    type: 'fellowship',
    country: 'Not specified',
    location: 'Not specified',
    workMode: 'on-site',
    fundingType: 'unspecified',
    deadline: '',
    programStartDate: '',
    programEndDate: '',
    createdAt,
    publishedAt: createdAt,
    summary:
      'This opportunity is no longer publicly available. Your application history has been preserved.',
    description:
      'The opportunity may have been unpublished, archived, or removed. Your application record and preparation history remain available.',
    eligibility: [],
    requirements: [],
    academicRequirements: [],
    skillsRequirements: [],
    requiredDocuments: [],
    tags: [],
    applicationUrl: '',
    officialSourceUrl: '',
    contactInformation: '',
  }
}
