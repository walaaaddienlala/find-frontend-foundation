import { Container, Section } from '@/components/layout/page-container'
import { LoadingState } from '@/components/shared/states'

export default function Loading() {
  return (
    <Section>
      <Container>
        <LoadingState variant="cards" count={6} label="Loading opportunities" />
      </Container>
    </Section>
  )
}
