import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type PreviewNoticeProps = {
  title: string
  children: ReactNode
  className?: string
}

/** Honest, consistent messaging for features that are not connected yet. */
export function PreviewNotice({ title, children, className }: PreviewNoticeProps) {
  return (
    <Alert variant="info" className={className} role="note">
      <Info aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
    </Alert>
  )
}
