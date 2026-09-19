'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, LogOut, Settings, Shield, ShieldCheck, Stethoscope, HeartPulse } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { cn } from '@/lib/utils'
import { planName } from '@/lib/session'

function initialsOf(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toLocaleUpperCase('tr-TR')
}

export function Sidebar() {
  const pathname = usePathname()
  const { navigation, meta, user, isPremium, role, signOut } = useRole()

  if (!user) return null

  const RoleIcon = role === 'admin' ? ShieldCheck : role === 'physio' ? Stethoscope : HeartPulse

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

      {/* Kullanıcı alanı — rol değiştirme yok, oturumdaki hesap gösterilir */}
      <div className="px-4 pt-4">
        <div className="rounded-xl border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {initialsOf(user.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <RoleIcon className="size-3" aria-hidden />
              {meta.shortLabel}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                isPremium
                  ? 'bg-chart-3/10 text-chart-3'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              <Shield className="size-3" aria-hidden />
              {planName(user.plan)}
            </span>
          </div>

          {!isPremium && role !== 'admin' && (
            <Link
              href="/premium"
              className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Shield className="size-3.5" aria-hidden />
              Premium&apos;a geç
            </Link>
          )}
        </div>
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
              title={item.hint}
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
        <button
          type="button"
          onClick={signOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="size-4.5" aria-hidden />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
