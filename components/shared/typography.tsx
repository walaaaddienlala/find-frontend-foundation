import type { ComponentProps, ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const headingVariants = cva('font-heading text-foreground text-balance', {
  variants: {
    size: {
      display:
        'text-4xl leading-[1.1] font-bold tracking-tight sm:text-5xl lg:text-6xl',
      h1: 'text-3xl leading-tight font-bold tracking-tight sm:text-4xl',
      h2: 'text-2xl leading-tight font-bold tracking-tight sm:text-3xl',
      h3: 'text-xl leading-snug font-semibold',
      h4: 'text-lg leading-snug font-semibold',
    },
  },
  defaultVariants: { size: 'h2' },
})

type HeadingLevel = 1 | 2 | 3 | 4

type HeadingProps = Omit<ComponentProps<'h2'>, 'children'> &
  VariantProps<typeof headingVariants> & {
    level?: HeadingLevel
    children: ReactNode
  }

/**
 * Semantic level (h1–h4) is independent from visual size,
 * so the document outline stays correct regardless of styling.
 */
export function Heading({
  level = 2,
  size,
  className,
  children,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as const
  const resolvedSize = size ?? (`h${level}` as const)
  return (
    <Tag
      className={cn(headingVariants({ size: resolvedSize }), className)}
      {...props}
    >
      {children}
    </Tag>
  )
}

const textVariants = cva('text-pretty', {
  variants: {
    variant: {
      lead: 'text-lg leading-relaxed text-muted-foreground sm:text-xl',
      body: 'text-base leading-relaxed text-foreground',
      muted: 'text-base leading-relaxed text-muted-foreground',
      small: 'text-sm leading-relaxed text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'body' },
})

type TextProps = ComponentProps<'p'> & VariantProps<typeof textVariants>

export function Text({ variant, className, ...props }: TextProps) {
  return <p className={cn(textVariants({ variant }), className)} {...props} />
}

export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'text-sm font-semibold tracking-wide text-cta-soft-foreground uppercase',
        className,
      )}
      {...props}
    />
  )
}
