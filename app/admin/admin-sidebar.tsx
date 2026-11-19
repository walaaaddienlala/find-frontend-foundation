import Link from 'next/link'

const navigation = [
  {
    label: 'Overview',
    href: '/admin',
    icon: '⌂',
  },
  {
    label: 'Opportunities',
    href: '/admin/opportunities',
    icon: '◇',
  },
  {
    label: 'Verification',
    href: '/admin/verification',
    icon: '✓',
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: '♧',
  },
  {
    label: 'Applications',
    href: '/admin/applications',
    icon: '▤',
  },
  {
    label: 'Organizations',
    href: '/admin/organizations',
    icon: '▦',
  },
  {
    label: 'Universities',
    href: '/admin/universities',
    icon: '▥',
  },
  {
    label: 'Institutions',
    href: '/admin/institutions',
    icon: '▣',
  },
  {
    label: 'Academy',
    href: '/admin/academy',
    icon: '✎',
  },
  {
    label: 'Courses',
    href: '/admin/courses',
    icon: '▶',
  },
  {
    label: 'Moderation',
    href: '/admin/moderation',
    icon: '⚑',
  },
  {
    label: 'Mentors',
    href: '/admin/mentors',
    icon: '☺',
  },
  {
    label: 'Events',
    href: '/admin/events',
    icon: '◷',
  },
  {
    label: 'Resources',
    href: '/admin/resources',
    icon: '❏',
  },
  {
    label: 'Success stories',
    href: '/admin/stories',
    icon: '★',
  },
  {
    label: 'AI configuration',
    href: '/admin/ai',
    icon: '✦',
  },
  {
    label: 'Chatbot',
    href: '/admin/chatbot',
    icon: '✉',
  },
  {
    label: 'Notifications',
    href: '/admin/notifications',
    icon: '♪',
  },
  {
    label: 'Support',
    href: '/admin/support',
    icon: '?',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: '◔',
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: '▧',
  },
  {
    label: 'Audit logs',
    href: '/admin/audit',
    icon: '☷',
  },
  {
    label: 'Roles & permissions',
    href: '/admin/roles',
    icon: '♙',
  },
  {
    label: 'Platform settings',
    href: '/admin/settings',
    icon: '⚙',
  },
  {
    label: 'Team',
    href: '/admin/team',
    icon: '♟',
  },
  {
    label: 'Feature status',
    href: '/admin/features',
    icon: '☰',
  },
]

export function AdminSidebar() {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
          F
        </div>

        <div>
          <p className="font-heading text-xl font-bold tracking-tight">
            Find
          </p>
          <p className="text-xs text-muted-foreground">
            Administration
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>

        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface text-lg">
                {item.icon}
              </span>

              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto hidden p-4 lg:block">
        <div className="rounded-2xl bg-secondary p-4">
          <p className="font-heading text-sm font-semibold text-primary">
            Discover. Prepare. Connect.
          </p>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Helping young people move from opportunity to outcome.
          </p>
        </div>
      </div>
    </aside>
  )
}