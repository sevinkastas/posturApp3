'use client'

import { Activity, Dumbbell, LifeBuoy, Shield, Users } from 'lucide-react'
import Link from 'next/link'
import { StatCard } from '@/components/dashboard/stat-card'
import { Panel } from '@/components/dashboard/panel'
import { getPlatformAnalytics } from '@/lib/analytics'
import { readRegistry } from '@/lib/registry-store'
import { readTickets } from '@/lib/support-tickets'
import { readPool } from '@/lib/exercise-pool'
import { cn } from '@/lib/utils'

/**
 * Admin / Genel Bakış — sistem yöneticisinin tek sayfa özet paneli.
 * Aktif kullanıcı, bekleyen onay, tarama hacmi ve sistem sağlığı metrikleri.
 */
export default function AdminDashboardPage() {
  const analytics = getPlatformAnalytics()
  const registry = readRegistry()
  const tickets = readTickets()
  const pool = readPool()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Yönetim Paneli</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sistem genel durumu ve yönetim işlemleri</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Kullanıcı" value={String(analytics.totalUsers)} icon={Users} />
        <StatCard label="Aktif Kullanıcı" value={String(analytics.activeUsers)} icon={Users} trend={{ direction: 'up', value: `${analytics.physioCount} uzman`, positive: true }} />
        <StatCard label="Bekleyen Onay" value={String(analytics.pendingApprovals)} icon={Shield} hint="Onay bekleyen fizyoterapist" />
        <StatCard label="Premium Üye" value={String(analytics.premiumCount)} icon={Shield} />
      </div>

      <AdminQuickLinks
        poolCount={pool.length}
        pendingCount={analytics.pendingApprovals}
        openTickets={tickets.filter((t) => t.status === 'open').length}
      />

      <RegisteredPhysios registry={registry} />
    </div>
  )
}



function AdminQuickLinks({ poolCount, pendingCount, openTickets }: { poolCount: number; pendingCount: number; openTickets: number }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel title="Sistem Sağlığı" description="Performans metrikleri" className="lg:col-span-2">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <span className="text-2xl font-bold text-chart-3">%99.96</span>
            <p className="text-[10px] text-muted-foreground">Uptime</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <span className="text-2xl font-bold text-primary">142ms</span>
            <p className="text-[10px] text-muted-foreground">API Latency</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <span className="text-2xl font-bold text-chart-3">%0.4</span>
            <p className="text-[10px] text-muted-foreground">Hata Oranı</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <span className="text-2xl font-bold text-primary">38ms</span>
            <p className="text-[10px] text-muted-foreground">DB Latency</p>
          </div>
        </div>
      </Panel>
      <Panel title="Hızlı Yönetim" description="Hızlı erişim">
        <div className="space-y-2">
          <QuickAdminLink href="/admin/exercises" label="Egzersiz Havuzu" icon={Dumbbell} desc={`${poolCount} hareket`} />
          <QuickAdminLink href="/admin/users" label="Kullanıcı Onayı" icon={Users} desc={`${pendingCount} bekleyen`} />
          <QuickAdminLink href="/admin/support" label="Destek Talepleri" icon={LifeBuoy} desc={`${openTickets} açık`} />
          <QuickAdminLink href="/admin/analytics" label="Analitik Rapor" icon={Activity} desc="Detaylı istatistik" />
        </div>
      </Panel>
    </div>
  )
}

function QuickAdminLink({ href, label, icon: Icon, desc }: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3 text-left text-sm font-medium transition-colors hover:bg-sidebar-accent/60">
      <Icon className="size-4.5 text-primary" aria-hidden />
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
    </Link>
  )
}

function RegisteredPhysios({ registry }: { registry: import('@/lib/registry-types').RegistryUser[] }) {
  return (
    <Panel title="Kayıtlı Uzmanlar" description="Onay durumuna göre">
      <ul className="space-y-2.5">
        {registry.filter((u) => u.role === 'physio').slice(0, 6).map((u) => (
          <li key={u.id} className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium">{u.name}</p>
              <p className="text-[10px] text-muted-foreground">{u.email}</p>
            </div>
            <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-medium', u.status === 'approved' ? 'bg-chart-3/10 text-chart-3' : u.status === 'pending' ? 'bg-chart-4/10 text-chart-4' : 'bg-destructive/10 text-destructive')}>
              {u.status === 'approved' ? 'Aktif' : u.status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
