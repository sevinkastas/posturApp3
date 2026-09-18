'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Settings } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { cn } from '@/lib/utils'
import { RoleSwitcher } from './role-switcher'

export function Sidebar() {
  const pathname = usePathname()
  const { navigation, meta } = useRole()

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground neon-glow">
          <Activity className="size-5" aria-hidden />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">
            Postur<span className="neon-text">App</span>
          </p>
          <p className="text-[11px] text-muted-foreground">AI Sağlık Analizi</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <RoleSwitcher />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Menü
        </p>
        {navigation.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-sidebar-accent text-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-8 items-center justify-center rounded-md transition-colors',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'bg-transparent text-muted-foreground group-hover:text-foreground',
                )}
              >
                <Icon className="size-4.5" aria-hidden />
              </span>
              {item.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-primary" aria-hidden />}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="mb-3 rounded-xl border border-border bg-muted/30 p-3">
          <p className="text-xs font-medium">{meta.label}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{meta.description}</p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-foreground"
        >
          <Settings className="size-4.5" aria-hidden />
          Ayarlar
        </Link>
      </div>
    </aside>
  )
}
