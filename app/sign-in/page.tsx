import type { Metadata } from 'next'

import { AccountPlaceholder } from '@/components/shared/account-placeholder'

export const metadata: Metadata = { title: 'Sign In' }

export default function SignInPage() {
  return (
    <AccountPlaceholder
      title="Sign in to Find"
      description="Signing in will let you save opportunities, check your readiness, and track applications."
    />
  )
}
