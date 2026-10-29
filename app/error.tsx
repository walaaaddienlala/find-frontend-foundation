'use client'

import { Button } from '@/components/ui/button'
import { Container, Section } from '@/components/layout/page-container'
import { ErrorState } from '@/components/shared/states'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Section>
      <Container size="narrow">
        <ErrorState
          title="Something went wrong"
          description="This page could not be loaded. Please try again."
          action={<Button onClick={reset}>Try again</Button>}
        />
      </Container>
    </Section>
  )
}
