import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/auth-form'

export const metadata: Metadata = {
  title: 'Get Started',
}

export default function GetStartedPage() {
  return <AuthForm mode="sign-up" />
}