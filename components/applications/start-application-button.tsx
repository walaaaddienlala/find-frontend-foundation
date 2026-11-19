'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { startApplicationAction } from '@/app/applications/actions'

export function StartApplicationButton({
  opportunityId,
  className,
}: {
  opportunityId: string
  className?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [applicationId, setApplicationId] = useState<string | null>(null)
  const [needsSignIn, setNeedsSignIn] = useState(false)

  function handleStart() {
    setMessage('')
    setNeedsSignIn(false)

    startTransition(async () => {
      const result = await startApplicationAction(opportunityId)
      setMessage(result.message)

      if (!result.success) {
        setNeedsSignIn(result.message.toLowerCase().includes('sign in'))
        return
      }

      setApplicationId(result.applicationId ?? null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        onClick={handleStart}
        disabled={isPending}
        className={className}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <ArrowRight className="size-4" aria-hidden="true" />
        )}
        {isPending ? 'Starting...' : 'Start Application Tracking'}
      </Button>
      {message && (
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {message}{' '}
          {needsSignIn ? (
            <Link href={`/sign-in?redirectTo=${encodeURIComponent(`/opportunities/${opportunityId}`)}`} className="font-medium text-primary underline">
              Sign in
            </Link>
          ) : applicationId ? (
            <Link href="/applications" className="font-medium text-primary underline">
              View my applications
            </Link>
          ) : null}
        </p>
      )}
    </div>
  )
}
