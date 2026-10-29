import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Container, Section } from '@/components/layout/page-container'

type CtaBandProps = {
  title: string
  description: string
  href: string
  actionLabel: string
}

export function CtaBand({ title, description, href, actionLabel }: CtaBandProps) {
  return (
    <Section>
      <Container>
        <div className="flex flex-col items-start gap-6 rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-10 md:flex-row md:items-center md:justify-between">
          <div className="flex max-w-xl flex-col gap-2">
            <h2 className="text-2xl font-semibold sm:text-3xl">{title}</h2>
            <p className="leading-relaxed text-primary-foreground/85">{description}</p>
          </div>
          <Link
            href={href}
            className={buttonVariants({ variant: 'cta', size: 'lg', className: 'shrink-0' })}
          >
            {actionLabel}
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  )
}
