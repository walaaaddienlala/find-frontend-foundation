import { Container, Section } from "@/components/layout/page-container";
import { LoadingState } from "@/components/shared/states";

export default function Loading() {
  return (
    <Section>
      <Container>
        <LoadingState label="Loading comparison…" variant="cards" count={3} />
      </Container>
    </Section>
  );
}
