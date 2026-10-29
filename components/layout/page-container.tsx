import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { Eyebrow, Heading, Text } from '@/components/shared/typography'

type ContainerProps = {
  children: ReactNode
  className?: string
  size?: 'default' | 'narrow' | 'wide'
}

const containerSize = {
  narrow: 'max-w-3xl',
  default: 'max-w-6xl',
  wide: 'max-w-7xl',
} as const

/** Horizontal page gutter + max width. Use for every section. */
export function Container({
  children,
  className,
  size = 'default',
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        containerSize[size],
        className,
      )}
    >
      {children}
    </div>
  )
}

type SectionProps = {
  children: ReactNode
  className?: string
  tone?: 'default' | 'surface' | 'brand'
  id?: string
  'aria-labelledby'?: string
}

const sectionTone = {
  default: '',
  surface: 'bg-surface',
  brand: 'bg-primary text-primary-foreground',
} as const

/** Vertical rhythm for page sections. */
export function Section({
  children,
  className,
  tone = 'default',
  ...props
}: SectionProps) {
  return (
    <section
      className={cn('py-16 sm:py-20 lg:py-24', sectionTone[tone], className)}
      {...props}
    >
      {children}
    </section>
  )
}

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  className?: string
}

/** Heading block for a section within a page (renders an h2). */
export function SectionHeader({ eyebrow, title, description, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex max-w-2xl flex-col gap-3', className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <Heading level={2}>{title}</Heading>
      {description ? <Text variant="muted">{description}</Text> : null}
    </div>
  )
}

type PageHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
  className?: string
}

/** Standard top-of-page heading block for inner pages. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn('border-b border-border bg-surface py-12 sm:py-16', className)}
    >
      <Container>
        <div className="flex max-w-3xl flex-col gap-4">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <Heading level={1} size="display">
            {title}
          </Heading>
          {description ? <Text variant="lead">{description}</Text> : null}
          {actions ? (
            <div className="mt-2 flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </div>
      </Container>
    </header>
  )
}
