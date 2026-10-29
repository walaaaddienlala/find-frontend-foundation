import type { Metadata } from 'next'

import { Container, PageHeader, Section } from '@/components/layout/page-container'
import { PreviewNotice } from '@/components/shared/preview-notice'
import { OpportunityBrowser } from '@/components/opportunities/opportunity-browser'
import { getOpportunities, isUsingSampleData } from '@/lib/data/opportunities'

export const metadata: Metadata = {
  title: 'Opportunities',
  description:
    'Browse internships, scholarships, fellowships, graduate programs, and competitions.',
}

export default async function OpportunitiesPage() {
  const opportunities = await getOpportunities()

  return (
    <>
      <PageHeader
        eyebrow="Opportunities"
        title="Find your next step"
        description="Browse internships, scholarships, fellowships, graduate programs, and competitions, then dig into what each one requires."
      />
      <Section className="pt-8 sm:pt-10 lg:pt-12">
        <Container className="flex flex-col gap-6">
          {isUsingSampleData ? (
            <PreviewNotice title="Sample listings">
              These listings are fictional placeholders used to design the
              experience. Real opportunities will appear once a data source is
              connected.
            </PreviewNotice>
          ) : null}
          <OpportunityBrowser opportunities={opportunities} />
        </Container>
      </Section>
    </>
  )
}
