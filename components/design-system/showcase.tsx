import type { ReactNode } from 'react'
import { ArrowRight, Bookmark, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Heading, Text, Eyebrow } from '@/components/shared/typography'
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states'
import { ApplicationStatusBadge, ReadinessBadge } from '@/components/shared/status-indicator'
import { applicationStatusMeta, readinessMeta } from '@/lib/status'
import type { ApplicationStatus, ReadinessLevel } from '@/lib/types'

export function ShowcaseSection({
  id,
  title,
  description,
  children,
}: {
  id: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-6 border-t border-border pt-10">
      <div className="flex flex-col gap-1.5">
        <Heading level={2} size="h3" id={id}>
          {title}
        </Heading>
        <Text variant="small">{description}</Text>
      </div>
      {children}
    </section>
  )
}

const swatches = [
  { name: 'Primary', token: 'primary', className: 'bg-primary' },
  { name: 'Primary strong', token: 'primary-strong', className: 'bg-primary-strong' },
  { name: 'Secondary', token: 'secondary', className: 'bg-secondary' },
  { name: 'CTA', token: 'cta', className: 'bg-cta' },
  { name: 'CTA soft', token: 'cta-soft', className: 'bg-cta-soft' },
  { name: 'Background', token: 'background', className: 'bg-background' },
  { name: 'Surface', token: 'surface', className: 'bg-surface' },
  { name: 'Card', token: 'card', className: 'bg-card' },
  { name: 'Muted', token: 'muted', className: 'bg-muted' },
  { name: 'Foreground', token: 'foreground', className: 'bg-foreground' },
  { name: 'Success', token: 'success', className: 'bg-success' },
  { name: 'Warning', token: 'warning', className: 'bg-warning' },
  { name: 'Info', token: 'info', className: 'bg-info' },
  { name: 'Destructive', token: 'destructive', className: 'bg-destructive' },
]

export function ColorSwatches() {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {swatches.map((swatch) => (
        <li key={swatch.token} className="flex flex-col gap-2">
          <span
            className={`h-16 rounded-lg border border-border ${swatch.className}`}
            aria-hidden="true"
          />
          <span className="flex flex-col">
            <span className="text-sm font-medium">{swatch.name}</span>
            <code className="font-mono text-xs text-muted-foreground">--{swatch.token}</code>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function TypographyScale() {
  return (
    <div className="flex flex-col gap-5">
      <Eyebrow>Eyebrow label</Eyebrow>
      <Heading level={3} size="display">Display heading</Heading>
      <Heading level={3} size="h1">Heading 1</Heading>
      <Heading level={3} size="h2">Heading 2</Heading>
      <Heading level={3} size="h3">Heading 3</Heading>
      <Heading level={3} size="h4">Heading 4</Heading>
      <Text variant="lead">Lead text introduces a page or section.</Text>
      <Text>Body text is used for most reading content across the product.</Text>
      <Text variant="muted">Muted text supports primary content.</Text>
      <Text variant="small">Small text is for captions and metadata.</Text>
    </div>
  )
}

export function ButtonShowcase() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="cta">Primary action</Button>
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Small</Button>
        <Button>Default</Button>
        <Button size="lg">
          Large
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Button>
        <Button size="icon" variant="outline" aria-label="Save opportunity">
          <Bookmark aria-hidden="true" />
        </Button>
        <Button disabled>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Disabled
        </Button>
      </div>
    </div>
  )
}

export function BadgeShowcase() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="cta">Highlight</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="neutral">Neutral</Badge>
      </div>
      <div className="flex flex-col gap-2">
        <Text variant="small">Application status</Text>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(applicationStatusMeta) as ApplicationStatus[]).map((status) => (
            <ApplicationStatusBadge key={status} status={status} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Text variant="small">Readiness</Text>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(readinessMeta) as ReadinessLevel[]).map((level) => (
            <ReadinessBadge key={level} level={level} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function FormShowcase() {
  return (
    <div
      role="group"
      aria-label="Form control examples"
      className="grid max-w-2xl gap-5 rounded-xl border border-border bg-card p-5 sm:grid-cols-2 sm:p-6"
    >
      <Field>
        <FieldLabel htmlFor="ds-name">Full name</FieldLabel>
        <Input id="ds-name" placeholder="Alex Morgan" autoComplete="name" />
      </Field>
      <Field data-invalid>
        <FieldLabel htmlFor="ds-email">Email</FieldLabel>
        <Input id="ds-email" type="email" aria-invalid defaultValue="alex@" aria-describedby="ds-email-error" />
        <FieldError id="ds-email-error">Enter a valid email address.</FieldError>
      </Field>
      <Field>
        <FieldLabel htmlFor="ds-level">Study level</FieldLabel>
        <NativeSelect id="ds-level" defaultValue="">
          <NativeSelectOption value="" disabled>
            Select a level
          </NativeSelectOption>
          <NativeSelectOption value="undergraduate">Undergraduate</NativeSelectOption>
          <NativeSelectOption value="graduate">Graduate</NativeSelectOption>
          <NativeSelectOption value="professional">Early professional</NativeSelectOption>
        </NativeSelect>
      </Field>
      <Field>
        <FieldLabel htmlFor="ds-disabled">Disabled</FieldLabel>
        <Input id="ds-disabled" disabled placeholder="Not editable" />
      </Field>
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor="ds-goals">Career goals</FieldLabel>
        <Textarea id="ds-goals" placeholder="What are you working toward?" />
        <FieldDescription>Optional. Helps tailor recommendations later.</FieldDescription>
      </Field>
      <Field orientation="horizontal" className="sm:col-span-2">
        <Checkbox id="ds-updates" />
        <FieldLabel htmlFor="ds-updates" className="font-normal">
          Notify me about new opportunities
        </FieldLabel>
      </Field>
    </div>
  )
}

export function CardShowcase() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Card title</CardTitle>
          <CardDescription>Supporting description text.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text variant="small">
            Cards group related content with a subtle border and generous padding.
          </Text>
        </CardContent>
        <CardFooter className="gap-2">
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="ghost">
            Secondary
          </Button>
        </CardFooter>
      </Card>
      <Card className="bg-surface">
        <CardHeader>
          <CardTitle>Surface card</CardTitle>
          <CardDescription>For secondary or nested content.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text variant="small">Uses the surface background token.</Text>
        </CardContent>
      </Card>
    </div>
  )
}

export function StateShowcase() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-xl border border-border bg-card p-4">
        <LoadingState label="Loading example" />
      </div>
      <EmptyState
        title="Nothing saved yet"
        description="Opportunities you save will appear here."
      />
      <ErrorState
        title="Could not load"
        description="Check your connection and try again."
      />
    </div>
  )
}
