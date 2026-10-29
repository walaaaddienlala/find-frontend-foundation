import Link from 'next/link'
import { ArrowRight, CalendarDays, CheckCircle2, CircleDashed } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Container } from '@/components/layout/page-container'
import { Heading, Text } from '@/components/shared/typography'
import { ReadinessBadge } from '@/components/shared/status-indicator'
import { authNav } from '@/lib/site-config'

export function Hero() {
  return (
    <section className="border-b border-border bg-surface">
      <Container className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
        <div className="flex flex-col items-start gap-6">
          <Badge variant="cta">Opportunity to outcome</Badge>
          <Heading level={1} size="display">
            Find the right opportunity, and get ready for it.
          </Heading>
          <Text variant="lead" className="max-w-xl">
            Discover internships, scholarships, and programs. Understand what
            they ask for, see where you stand, and prepare with a clear plan.
          </Text>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link href="/opportunities" className={buttonVariants({ variant: 'cta', size: 'lg' })}>
              Explore opportunities
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
            <Link
              href={authNav.getStarted.href}
              className={buttonVariants({ variant: 'outline', size: 'lg' })}
            >
              {authNav.getStarted.label}
            </Link>
          </div>
        </div>

        <ReadinessPreview />
      </Container>
    </section>
  )
}

function ReadinessPreview() {
  const checklist = [
    { label: 'Currently enrolled', done: true },
    { label: 'Data analysis coursework', done: true },
    { label: 'Portfolio project', done: false },
    { label: 'Recommendation letter', done: false },
  ]

  return (
    <figure className="flex flex-col gap-3">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-sm text-muted-foreground">Internship</p>
            <p className="font-heading text-lg font-semibold">Data Analyst Intern</p>
          </div>
          <ReadinessBadge level="almost" />
        </div>
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="size-4" aria-hidden="true" />
          Applications close in 3 weeks
        </p>
        <ul className="mt-5 flex flex-col gap-2.5 border-t border-border pt-5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-sm">
              {item.done ? (
                <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <CircleDashed className="size-4 shrink-0 text-cta" aria-hidden="true" />
              )}
              <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>
                {item.label}
              </span>
              <span className="sr-only">{item.done ? '(complete)' : '(to do)'}</span>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="text-center text-xs text-muted-foreground">
        Illustrative example of a readiness check
      </figcaption>
    </figure>
  )
}
