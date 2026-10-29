'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Logo } from '@/components/brand/logo'
import { NavLinks } from '@/components/layout/nav-links'
import { authNav, mainNav } from '@/lib/site-config'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Open menu" />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85%] max-w-sm gap-0 p-0">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle>
            <Logo asLink={false} />
          </SheetTitle>
          <SheetDescription className="sr-only">
            Site navigation
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-3 py-4">
          <NavLinks items={mainNav} orientation="vertical" onNavigate={close} />
        </nav>
        <div className="flex flex-col gap-3 border-t border-border p-5">
          <Link
            href={authNav.getStarted.href}
            onClick={close}
            className={cn(buttonVariants({ variant: 'cta', size: 'lg' }), 'w-full')}
          >
            {authNav.getStarted.label}
          </Link>
          <Link
            href={authNav.signIn.href}
            onClick={close}
            className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'w-full')}
          >
            {authNav.signIn.label}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
