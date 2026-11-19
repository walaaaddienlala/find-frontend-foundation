'use client'



import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSafeReturnTo } from '@/lib/auth/redirect'



type AuthFormProps = {
mode: 'sign-in' | 'sign-up'
}



export function AuthForm({ mode }: AuthFormProps) {
const router = useRouter()
const isSignUp = mode === 'sign-up'
const [returnTo, setReturnTo] = useState('/opportunities')

useEffect(() => {
  setReturnTo(getSafeReturnTo(new URLSearchParams(window.location.search).get('redirectTo'), window.location.origin))
}, [])

const authSwitchHref = `${isSignUp ? '/sign-in' : '/get-started'}?redirectTo=${encodeURIComponent(returnTo)}`



const [fullName, setFullName] = useState('')
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
const [message, setMessage] = useState('')



async function handleSubmit(event: FormEvent) {
event.preventDefault()
setLoading(true)
setError('')
setMessage('')

try {
  const supabase = createClient()

  if (isSignUp) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: (() => {
          const callbackUrl = new URL('/auth/callback', window.location.origin)
          callbackUrl.searchParams.set('next', returnTo)
          return callbackUrl.toString()
        })(),
      },
    })

    if (error) throw error

    setMessage(
      'Account created! Please check your email to confirm your account.',
    )
  } else {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

        await supabase.auth.getUser()

    router.replace(returnTo)
    router.refresh()
  }
} catch (err) {
  setError(
    err instanceof Error
      ? err.message
      : 'Something went wrong. Please try again.',
  )
} finally {
  setLoading(false)
}


}



return (
  <section className="flex min-h-[70vh] items-center justify-center px-4 py-16">
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          {isSignUp ? 'Create your Find account' : 'Welcome back'}
        </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        {isSignUp
          ? 'Start discovering opportunities and building your future.'
          : 'Sign in to continue your journey with Find.'}
      </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-5">
      {isSignUp && (
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full name
          </label>

          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Your full name"
            required
            autoComplete="name"
            className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          minLength={8}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />

        {isSignUp && (
          <p className="text-xs text-muted-foreground">
            Use at least 8 characters.
          </p>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground"
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? 'Please wait...'
          : isSignUp
            ? 'Create account'
            : 'Sign in'}
      </button>
    </form>

    <p className="mt-6 text-center text-sm text-muted-foreground">
      {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
      <Link
        href={authSwitchHref}
        className="font-semibold text-primary hover:underline"
      >
        {isSignUp ? 'Sign in' : 'Get started'}
      </Link>
    </p>
  </div>
</section>


)
}