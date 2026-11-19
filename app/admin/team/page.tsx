export const metadata = {
  title: 'Team Management',
}

export default function AdminTeamPage() {
  return (
    <section className="space-y-3">
      <p className="text-sm font-semibold text-primary">
        Access management
      </p>

      <h2 className="font-heading text-3xl font-bold">
        Team & Roles
      </h2>

      <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
        Manage internal Find team members and assign
        platform permissions.
      </p>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-10 text-center">
        <p className="font-semibold">
          Team management is coming next.
        </p>

        <p className="mt-2 text-sm text-muted-foreground">
          Role assignment and management will be connected
          through secure server-side operations.
        </p>
      </div>
    </section>
  )
}