'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

type Props = {
  opportunityId: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function SaveOpportunityButton({
  opportunityId,
  variant = 'outline',
  size = 'default',
  className,
}: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function checkBookmark() {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!active) return

      if (authError || !user) {
        setLoading(false)
        return
      }
      setUserId(user.id)

      const { data, error } = await supabase
        .from('saved_opportunities')
        .select('id')
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)
        .maybeSingle()

      if (!active) return
      if (error) {
        console.error('Error checking saved opportunity:', error.message)
        setLoading(false)
        return
      }

      setSaved(Boolean(data))
      setLoading(false)
    }

    void checkBookmark()
    return () => { active = false }
  }, [opportunityId])

  async function handleSave() {
    if (saving || loading) return
    const supabase = createClient()

    if (!userId) {
      const returnTo = `/opportunities/${encodeURIComponent(opportunityId)}`
      router.push(`/sign-in?redirectTo=${encodeURIComponent(returnTo)}`)
      return
    }

    setSaving(true)

    if (saved) {
      const { data, error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', userId)
        .eq('opportunity_id', opportunityId)
        .select('id')

      if (error) {
        console.error('Error removing saved opportunity:', error.message)
        setSaving(false)
        return
      }

      // If another tab changed the bookmark, read the authoritative state.
      if (!data?.length) {
        const { data: current, error: refreshError } = await supabase
          .from('saved_opportunities')
          .select('id')
          .eq('user_id', userId)
          .eq('opportunity_id', opportunityId)
          .maybeSingle()
        if (refreshError) {
          setSaving(false)
          return
        }
        setSaved(Boolean(current))
      } else {
        setSaved(false)
      }
    } else {
      const { error } = await supabase.from('saved_opportunities').insert({
        user_id: userId,
        opportunity_id: opportunityId,
      })

      if (error) {
        // A duplicate insert can happen when another tab saves simultaneously.
        const { data: current, error: refreshError } = await supabase
          .from('saved_opportunities')
          .select('id')
          .eq('user_id', userId)
          .eq('opportunity_id', opportunityId)
          .maybeSingle()
        if (refreshError || !current) {
          console.error('Error saving opportunity:', error.message)
          setSaving(false)
          return
        }
      }
      setSaved(true)
    }

    setSaving(false)
    router.refresh()
  }

  return (
    <Button
      type="button"
      variant={saved ? 'secondary' : variant}
      size={size}
      className={className}
      onClick={handleSave}
      disabled={loading || saving}
      aria-label={saved ? 'Remove saved opportunity' : 'Save opportunity'}
      aria-pressed={saved}
    >
      {loading || saving
        ? <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        : saved
          ? <BookmarkCheck className="size-4" aria-hidden="true" />
          : <Bookmark className="size-4" aria-hidden="true" />}
      {size !== 'icon' && (
        <span>{loading ? 'Checking...' : saving ? 'Saving...' : saved ? 'Saved' : 'Save Opportunity'}</span>
      )}
    </Button>
  )
}
