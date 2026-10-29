import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Container, Section, SectionHeader } from '@/components/layout/page-container'
import { CtaBand } from '@/components/shared/cta-band'
import { Hero } from '@/components/home/hero'
import { JourneySteps } from '@/components/home/journey-steps'
import { OpportunityCard } from '@/components/opportunities/opportunity-card'
import { getOpportunities } from '@/lib/data/opportunities'

export default async function HomePage() {
  const featured = (await getOpportunities()).slice(0, 3)

  return (
    <>
      <Hero />

      <Section>
        <Container className="flex flex-col gap-10">
          <SectionHeader
            eyebrow="How Find helps"
            title="One clear path from discovery to application"
            description="Find brings every step of pursuing an opportunity together, so you always know what to do next."
          />
          <JourneySteps />
        </Container>
      </Section>

      <Section className="bg-surface">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeader
              eyebrow="Opportunities"
              title="A preview of what you can explore"
              description="Sample listings showing how opportunities are presented."
            />
            <Link
              href="/opportunities"
              className={buttonVariants({ variant: 'outline', className: 'w-fit shrink-0' })}
            >
              View all
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((opportunity) => (
              <li key={opportunity.id}>
                <OpportunityCard opportunity={opportunity} />
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaBand
        title="Ready to find your next opportunity?"
        description="Start by exploring what is out there. Personal readiness checks and tracking are on the way."
        href="/opportunities"
        actionLabel="Explore opportunities"
      />
    </>
  )
}
