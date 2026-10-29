import type { Metadata } from 'next'

import { AccountPlaceholder } from '@/components/shared/account-placeholder'

export const metadata: Metadata = { title: 'Get Started' }

export default function GetStartedPage() {
  return (
    <AccountPlaceholder
      title="Create your Find account"
      description="Your account will hold your profile, saved opportunities, readiness checks, and application tracker."
    />
  )
}
