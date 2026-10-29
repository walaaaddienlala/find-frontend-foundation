import Link from 'next/link'
import { ArrowRight, LockKeyhole } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Container, Section } from '@/components/layout/page-container'
import { Heading, Text } from '@/components/shared/typography'

type AccountPlaceholderProps = {
  title: string
  description: string
}

/** Shown on account routes until authentication is implemented. */
export function AccountPlaceholder({ title, description }: AccountPlaceholderProps) {
  return (
    <Section>
      <Container size="narrow">
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 rounded-2xl border border-border bg-card px-6 py-10 text-center sm:px-10">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <LockKeyhole className="size-6" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-2">
            <Heading level={1} size="h2">
              {title}
            </Heading>
            <Text variant="muted">{description}</Text>
          </div>
          <p className="rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
            Accounts are not available yet. You can still browse opportunities
            without signing in.
          </p>
          <Link href="/opportunities" className={buttonVariants({ variant: 'cta', className: 'w-full' })}>
            Explore opportunities
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  )
}
