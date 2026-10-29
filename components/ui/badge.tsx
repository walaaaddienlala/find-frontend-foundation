import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        cta: "bg-cta-soft text-cta-soft-foreground",
        success: "bg-success-soft text-success-soft-foreground",
        warning: "bg-warning-soft text-warning-soft-foreground",
        info: "bg-info-soft text-info-soft-foreground",
        destructive: "bg-destructive-soft text-destructive-soft-foreground",
        neutral: "bg-muted text-muted-foreground",
        outline: "border-border-strong bg-card text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>["variant"]>

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants, type BadgeVariant }
