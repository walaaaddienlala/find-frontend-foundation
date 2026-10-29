import type { Metadata } from 'next'
import { Compass, HeartHandshake, ShieldCheck } from 'lucide-react'

import { Container, PageHeader, Section, SectionHeader } from '@/components/layout/page-container'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'About',
  description: 'Why Find exists and the principles behind it.',
}

const principles = [
  {
    title: 'Clarity first',
    description:
      'Requirements and eligibility should be easy to understand, without jargon or guesswork.',
    icon: Compass,
  },
  {
    title: 'Honest guidance',
    description:
      'We show where you stand and what to work on. We never promise outcomes we cannot guarantee.',
    icon: ShieldCheck,
  },
  {
    title: 'Encouraging by design',
    description:
      'Gaps are a starting point, not a verdict. Every step should leave you with a next action.',
    icon: HeartHandshake,
  },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About Find"
        title="Helping early-career talent turn opportunities into outcomes"
        description="Find is built for university students, recent graduates, and young professionals who want a clearer path from finding an opportunity to being ready for it."
      />
      <Section>
        <Container className="flex flex-col gap-10">
          <SectionHeader
            title="What guides us"
            description="The principles shaping how Find is designed."
          />
          <ul className="grid gap-4 md:grid-cols-3">
            {principles.map((principle) => (
              <li key={principle.title}>
                <Card className="h-full">
                  <CardHeader className="gap-4">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-cta-soft text-cta-soft-foreground">
                      <principle.icon className="size-5" aria-hidden="true" />
                    </span>
                    <CardTitle>{principle.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {principle.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  )
}
