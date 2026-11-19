export const metadata = {
  title: 'Manage Users',
}

export default function AdminUsersPage() {
  return (
    <section className="space-y-3">
      <p className="text-sm font-semibold text-primary">
        Platform management
      </p>

      <h2 className="font-heading text-3xl font-bold">
        Users
      </h2>

      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Manage Find accounts, review profile information,
        and monitor user activity.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="font-semibold">
          User management is coming next.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          User data will be connected after implementing
          the required secure admin permissions.
        </p>
      </div>
    </section>
  )
}