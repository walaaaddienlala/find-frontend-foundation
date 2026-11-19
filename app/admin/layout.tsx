import { redirect } from 'next/navigation'

import { AdminHeader } from './admin-header'
import { AdminSidebar } from './admin-sidebar'
import { isSupabaseConfigured } from '@/lib/env'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type AdminLayoutProps = Readonly<{
  children: React.ReactNode
}>

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  if (!isSupabaseConfigured()) {
    redirect('/opportunities')
  }

  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/sign-in')
  }

  const { data: isAdmin, error: roleError } = await supabase.rpc(
    'has_role',
    {
      requested_role: 'admin',
    },
  )

  if (roleError || isAdmin !== true) {
    redirect('/opportunities')
  }

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <AdminHeader email={user.email ?? 'Admin'} />

        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}