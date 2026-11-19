export type NavItem = {
  label: string
  href: string
}

export const siteConfig = {
  name: 'Find',
  tagline: 'From opportunity to outcome.',
  description:
    'Find helps university students, recent graduates, and young professionals discover opportunities, understand eligibility, assess readiness, close gaps, and track applications.',
} as const

export const mainNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Opportunities', href: '/opportunities' },
  { label: 'Deadlines', href: '/deadlines' },
  { label: 'Compare', href: '/compare' },
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'About', href: '/about' },
]

export const authNav = {
  signIn: { label: 'Sign In', href: '/sign-in' },
  getStarted: { label: 'Get Started', href: '/get-started' },
} as const satisfies Record<string, NavItem>

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'Explore',
    items: [
      { label: 'Opportunities', href: '/opportunities' },
      { label: 'Deadlines', href: '/deadlines' },
      { label: 'Compare', href: '/compare' },
      { label: 'How It Works', href: '/how-it-works' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Design System', href: '/design-system' },
    ],
  },
  {
    title: 'Account',
    items: [{ label: 'Dashboard', href: '/dashboard' }, authNav.signIn, authNav.getStarted],
  },
]
