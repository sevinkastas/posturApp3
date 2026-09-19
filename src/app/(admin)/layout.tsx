'use client'

import type { ReactNode } from 'react'
import { AppShell } from '@/components/layout/app-shell'

/**
 * Admin panel layout — shares the same shell (sidebar, navbar, bottom bar)
 * with the client area, but because the user's role is 'admin' the Sidebar
 * component reads ADMIN_NAVIGATION from roles.ts via useRole().
 *
 * Admin registration is impossible — only the fixed admin account can sign in,
 * so this layout is only reachable by the single system administrator.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}
