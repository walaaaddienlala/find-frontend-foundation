import Link from 'next/link'
import { SearchX } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { Container, Section } from '@/components/layout/page-container'
import { EmptyState } from '@/components/shared/states'

export default function NotFound() {
  return (
    <Section>
      <Container size="narrow">
        <EmptyState
          icon={SearchX}
          title="We couldn't find that page"
          description="The link may be outdated, or the page may have moved."
          action={
            <Link href="/" className={buttonVariants()}>
              Back to home
            </Link>
          }
        />
      </Container>
    </Section>
  )
}
