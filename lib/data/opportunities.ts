import type { Opportunity } from '@/lib/types'
import { sampleOpportunities } from './sample-opportunities'

/**
 * Data access for opportunities.
 * Currently backed by local sample data. Replace the bodies of these
 * functions with real backend calls; the signatures are what pages depend on.
 */

export async function getOpportunities(): Promise<Opportunity[]> {
  return sampleOpportunities
}

export async function getOpportunityById(
  id: string,
): Promise<Opportunity | undefined> {
  return sampleOpportunities.find((opportunity) => opportunity.id === id)
}

export const isUsingSampleData = true
