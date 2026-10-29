import type { Metadata } from 'next'

import { Container, PageHeader, Section } from '@/components/layout/page-container'
import { CtaBand } from '@/components/shared/cta-band'
import { JourneySteps } from '@/components/home/journey-steps'
import { PreviewNotice } from '@/components/shared/preview-notice'

export const metadata: Metadata = {
  title: 'How It Works',
  description:
    'How Find guides you from discovering an opportunity to preparing and applying.',
}

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        eyebrow="How it works"
        title="From opportunity to outcome, step by step"
        description="Pursuing an opportunity usually means juggling listings, requirements, and deadlines across many places. Find organizes that journey into six clear stages."
      />
      <Section>
        <Container className="flex flex-col gap-8">
          <PreviewNotice title="Early version">
            Discovery and eligibility details are available today. Readiness
            checks, gap analysis, learning paths, and application tracking are in
            development.
          </PreviewNotice>
          <JourneySteps />
        </Container>
      </Section>
      <CtaBand
        title="Start with discovery"
        description="Browse sample opportunities to see how Find presents eligibility and requirements."
        href="/opportunities"
        actionLabel="Explore opportunities"
      />
    </>
  )
}
