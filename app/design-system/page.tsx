import type { Metadata } from 'next'

import { Container, PageHeader, Section } from '@/components/layout/page-container'
import {
  BadgeShowcase,
  ButtonShowcase,
  CardShowcase,
  ColorSwatches,
  FormShowcase,
  ShowcaseSection,
  StateShowcase,
  TypographyScale,
} from '@/components/design-system/showcase'

export const metadata: Metadata = {
  title: 'Design System',
  description: 'Tokens and reusable components that make up the Find interface.',
}

export default function DesignSystemPage() {
  return (
    <>
      <PageHeader
        eyebrow="Design system"
        title="Find interface foundations"
        description="Shared tokens and components used across Find. Change a token in globals.css and it updates everywhere."
      />
      <Section className="pt-0 sm:pt-0 lg:pt-0">
        <Container className="flex flex-col gap-12 pt-10">
          <ShowcaseSection id="ds-colors" title="Color" description="Green for trust and progress, orange for key actions, warm neutrals for comfortable reading.">
            <ColorSwatches />
          </ShowcaseSection>
          <ShowcaseSection id="ds-type" title="Typography" description="Plus Jakarta Sans for headings, Inter for body text.">
            <TypographyScale />
          </ShowcaseSection>
          <ShowcaseSection id="ds-buttons" title="Buttons" description="Use the orange CTA once per view for the most important action.">
            <ButtonShowcase />
          </ShowcaseSection>
          <ShowcaseSection id="ds-badges" title="Badges and status" description="Status colors always pair with a text label, never color alone.">
            <BadgeShowcase />
          </ShowcaseSection>
          <ShowcaseSection id="ds-forms" title="Form controls" description="Labeled fields with descriptions, validation, and clear focus rings.">
            <FormShowcase />
          </ShowcaseSection>
          <ShowcaseSection id="ds-cards" title="Cards" description="Bordered containers with consistent padding.">
            <CardShowcase />
          </ShowcaseSection>
          <ShowcaseSection id="ds-states" title="Loading, empty, and error states" description="Announced to assistive technology and always offer a way forward when possible.">
            <StateShowcase />
          </ShowcaseSection>
        </Container>
      </Section>
    </>
  )
}
