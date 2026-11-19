import Link from 'next/link'

export function AdminHeader({
  email,
}: {
  email: string
}) {
  return (
    <header className="flex min-h-20 flex-wrap items-center justify-between gap-4 border-b border-border bg-card px-5 py-4 sm:px-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Find Platform
        </p>

        <h1 className="mt-1 font-heading text-lg font-bold">
          Administration
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold">
            Administrator
          </p>

          <p className="max-w-52 truncate text-xs text-muted-foreground">
            {email}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          A
        </div>

        <Link
          href="/opportunities"
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-surface"
        >
          View Website
        </Link>
      </div>
    </header>
  )
}