'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Bell, Menu, Search, Settings, X } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { cn } from '@/lib/utils'
import { RoleSwitcher } from './role-switcher'
import { NotificationBell } from './notification'

const EXTRA_TITLES: Record<string, string> = {
  '/settings': 'Ayarlar',
}

function usePageTitle() {
  const pathname = usePathname()
  const { navigation } = useRole()
  const match = navigation.find((item) => item.href === pathname)
  return match?.label ?? EXTRA_TITLES[pathname] ?? 'Panel'
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const title = usePageTitle()
  const { navigation, meta } = useRole()

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          aria-label="Menüyü aç"
        >
          <Menu className="size-5" aria-hidden />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
            {meta.shortLabel}
          </p>
          <h1 className="truncate text-lg font-semibold leading-tight tracking-tight">{title}</h1>
        </div>

        <div className="hidden items-center rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground md:flex">
          <Search className="mr-2 size-4" aria-hidden />
          <input
            type="search"
            placeholder="Ara..."
            className="w-40 bg-transparent outline-none placeholder:text-muted-foreground"
            aria-label="Ara"
          />
        </div>

        <div className="flex items-center gap-4">
        {/* Bildirimler Alanı - Tek satırlık tertemiz kullanım */}
        <NotificationBell />
        
        {/* Kullanıcı Profili Avatarı */}
      </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 py-1 pl-1 pr-2.5">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary">
            {meta.id === 'physio' ? 'DR' : 'AY'}
          </span>
          <span className="hidden text-sm font-medium sm:block">
            {meta.id === 'physio' ? 'Dr. Elif Yıldız' : 'Ahmet Yılmaz'}
          </span>
        </div>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r border-sidebar-border bg-sidebar shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground neon-glow">
                  <Activity className="size-5" aria-hidden />
                </span>
                <p className="text-sm font-semibold tracking-tight">
                  Postur<span className="neon-text">App</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                aria-label="Kapat"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <div className="px-4 pt-4">
              <RoleSwitcher />
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              {navigation.map((item) => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      active
                        ? 'bg-sidebar-accent text-foreground'
                        : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4.5" aria-hidden />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="border-t border-sidebar-border p-4">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Settings className="size-4.5" aria-hidden />
                Ayarlar
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
