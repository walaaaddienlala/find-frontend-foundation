import { Badge } from '@/components/ui/badge'
import { journeySteps } from '@/lib/journey'

export function JourneySteps() {
  return (
    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {journeySteps.map((step, index) => (
        <li
          key={step.title}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
              <step.icon className="size-5" aria-hidden="true" />
            </span>
            {step.available ? (
              <Badge variant="success">Available</Badge>
            ) : (
              <Badge variant="neutral">Coming soon</Badge>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <h3 className="text-lg font-semibold">
              <span className="text-muted-foreground">{index + 1}. </span>
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
