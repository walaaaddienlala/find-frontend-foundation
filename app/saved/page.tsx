import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Bookmark, Search } from 'lucide-react'

import { Container, PageHeader, Section } from '@/components/layout/page-container'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { buttonVariants } from '@/components/ui/button'

import { isSupabaseConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'
import { getSavedOpportunities } from '@/lib/data/applications'

export const metadata: Metadata = {
  title: 'Saved Opportunities',
  description: 'Your saved opportunities on Find.',
}

export const dynamic = 'force-dynamic'

export default async function SavedOpportunitiesPage() {
  if (!isSupabaseConfigured()) {
    redirect('/opportunities')
  }

  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/sign-in?redirectTo=/saved')
  }

  const opportunities = await getSavedOpportunities()

  return (
    <>
      <PageHeader
        eyebrow="Your Workspace"
        title="Saved Opportunities"
        description="Keep track of the opportunities you are interested in and come back to them whenever you are ready."
      />

      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <Container className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <Bookmark
                className="size-5 text-primary"
                aria-hidden="true"
              />
            </div>

            <div>
              <p className="text-2xl font-semibold">
                {opportunities.length}
              </p>

              <p className="text-sm text-muted-foreground">
                Saved opportunities
              </p>
            </div>
          </div>

          {opportunities.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border px-6 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-muted">
                <Bookmark
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  No saved opportunities yet
                </h2>

                <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                  When you find an opportunity that interests you,
                  save it here so you can review it later.
                </p>
              </div>

              <Link
                href="/opportunities"
                className={buttonVariants()}
              >
                <Search
                  data-icon="inline-start"
                  aria-hidden="true"
                />
                Explore Opportunities
              </Link>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}