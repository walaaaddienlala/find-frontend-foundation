import Link from 'next/link'

import { AdminStatCard } from './admin-stat-card'

import { isSupabaseConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Admin Overview',
}

export const dynamic = 'force-dynamic'

export default async function AdminOverviewPage() {
  // The admin layout redirects when Supabase is not configured; do not create a client here.
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()

  const { count, error } = await supabase
    .from('opportunities')
    .select('*', {
      count: 'exact',
      head: true,
    })
    .eq('status', 'published')

  const publishedCount = error ? '—' : String(count ?? 0)

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-sm font-semibold text-primary">
          Workspace overview
        </p>

        <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome to Find Admin.
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Manage opportunities, review information, and maintain
          the quality of the Find platform.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Published opportunities"
          value={publishedCount}
          description="Currently published listings"
          icon="◇"
        />

        <AdminStatCard
          label="User management"
          value="Ready"
          description="User administration module"
          icon="♧"
        />

        <AdminStatCard
          label="Verification"
          value="Ready"
          description="Opportunity review module"
          icon="✓"
        />

        <AdminStatCard
          label="Team management"
          value="Ready"
          description="Roles and permissions module"
          icon="♙"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-heading text-lg font-bold">
                Platform Management
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage the essential parts of Find.
              </p>
            </div>

            <span className="rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success-soft-foreground">
              Admin access verified
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <ManagementLink
              href="/admin/opportunities"
              title="Manage Opportunities"
              description="Create, edit, publish and archive listings."
            />

            <ManagementLink
              href="/admin/verification"
              title="Review Opportunities"
              description="Check sources and verify opportunity details."
            />

            <ManagementLink
              href="/admin/users"
              title="Manage Users"
              description="View platform accounts and profiles."
            />

            <ManagementLink
              href="/admin/team"
              title="Manage Team"
              description="Manage Find team roles and access."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h3 className="font-heading text-lg font-bold">
            Find Platform
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Discover opportunities. Prepare people. Connect
            talent with the right opportunities.
          </p>

          <div className="mt-6 rounded-xl bg-secondary p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Current phase
            </p>

            <p className="mt-2 font-heading font-bold">
              Platform Foundation
            </p>

            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Building the opportunity database, user profiles,
              and management tools.
            </p>
          </div>

          <Link
            href="/opportunities"
            className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
          >
            Visit public website →
          </Link>
        </div>
      </section>
    </div>
  )
}

function ManagementLink({
  href,
  title,
  description,
}: {
  href: string
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-secondary/50"
    >
      <p className="font-semibold">{title}</p>

      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {description}
      </p>

      <span className="mt-3 inline-block text-xs font-semibold text-primary">
        Open section →
      </span>
    </Link>
  )
}