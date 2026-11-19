type AdminStatCardProps = {
  label: string
  value: string
  description: string
  icon: string
}

export function AdminStatCard({
  label,
  value,
  description,
  icon,
}: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {label}
        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-lg text-primary">
          {icon}
        </div>
      </div>

      <p className="mt-5 font-heading text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-2 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  )
}