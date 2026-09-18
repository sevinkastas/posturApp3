'use client'

import type { ReactNode } from 'react'
import { RoleProvider } from '@/lib/role-context'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { BottomBar } from './bottom-bar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <div className="flex min-h-dvh bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar />
          <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
            <div className="mx-auto w-full max-w-6xl">{children}</div>
          </main>
        </div>
        <BottomBar />
      </div>
    </RoleProvider>
  )
}
