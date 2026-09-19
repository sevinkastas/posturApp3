'use client'

import { Activity, Users, Dumbbell, LifeBuoy, BarChart3 } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { StatCard } from '@/components/dashboard/stat-card'
import { getPlatformAnalytics } from '@/lib/analytics'
import { readRegistry } from '@/lib/registry-store'
import { readTickets } from '@/lib/support-tickets'
import { readPool } from '@/lib/exercise-pool'

/**
 * Admin / Analitik — platform genelinde kullanıcı, tarama ve sistem metriklerini gösterir.
 */
export default function AdminAnalyticsPage() {
  const analytics = getPlatformAnalytics()
  const registry = readRegistry()
  const tickets = readTickets()
  const pool = readPool()

    const physioList = registry.filter((u) => u.role === 'physio')
  const patientList = registry.filter((u) => u.role === 'patient')


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Sistem Analitiği</h1>
        <p className="mt-1 text-sm text-muted-foreground">Platform kullanımı, tarama hacmi ve sistem sağlığı</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Toplam Kullanıcı" value={String(analytics.totalUsers)} icon={Users} />
        <StatCard label="Aktif Kullanıcı" value={String(analytics.activeUsers)} icon={Users} trend={{ direction: 'up', value: '+12%', positive: true }} />
        <StatCard label="Fizyoterapist" value={String(analytics.physioCount)} icon={Activity} hint="Onaylı uzman" />
        <StatCard label="Premium Üye" value={String(analytics.premiumCount)} icon={Users} trend={{ direction: 'up', value: '+8%', positive: true }} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StatCard label="Tarama (bugün)" value={String(analytics.scansToday)} icon={BarChart3} trend={{ direction: 'up', value: '+20%', positive: true }} />
        <StatCard label="Ortalama Skor" value={String(analytics.avgScore)} icon={Activity} hint="30 günlük" />
        <StatCard label="Egzersiz" value={String(pool.length)} icon={Dumbbell} hint="Havuzda" />
        <StatCard label="Destek Bileti" value={String(tickets.length)} icon={LifeBuoy} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Günlük Tarama Hacmi" description="Son 7 gün">
          <div className="flex items-end gap-2 h-48">
            {analytics.scansSeries.map((day) => (
              <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-medium tabular-nums text-primary">{day.scans}</span>
                <div className="w-full rounded-t-sm bg-primary/20" style={{ height: `${(day.scans / 320) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground">{day.label}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Destek Talebi İstatistiği" description="Kategori dağılımı">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-xs">Açık</span>
              <span className="font-medium text-chart-4">{analytics.ticketStats.open}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-xs">İşlemde</span>
              <span className="font-medium text-primary">{analytics.ticketStats.inProgress}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
              <span className="text-xs">Çözüldü</span>
              <span className="font-medium text-chart-3">{analytics.ticketStats.resolved}</span>
            </div>
          </div>
        </Panel>
      </div>

      <Panel title="Kullanıcı Tipine Göre Dağılım" description="Rol bazlı">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
            <span className="text-3xl font-bold text-primary">{physioList.length}</span>
            <p className="text-xs text-muted-foreground">Fizyoterapist</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/30 p-4 text-center">
            <span className="text-3xl font-bold text-chart-3">{patientList.length}</span>
            <p className="text-xs text-muted-foreground">Danışan</p>
          </div>
        </div>
      </Panel>

      <Panel title="Sistem Sağlığı" description="Gerçek zamanlı metrikler">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <div className="text-2xl font-bold text-chart-3">{analytics.systemHealth.uptime}</div>
            <p className="text-[10px] text-muted-foreground">Uptime</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <div className="text-2xl font-bold text-primary">{analytics.systemHealth.apiLatencyMs}ms</div>
            <p className="text-[10px] text-muted-foreground">API Latency</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <div className="text-2xl font-bold text-chart-3">{analytics.systemHealth.errorRate}</div>
            <p className="text-[10px] text-muted-foreground">Hata Oranı</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
            <div className="text-2xl font-bold text-primary">{analytics.systemHealth.dbLatencyMs}ms</div>
            <p className="text-[10px] text-muted-foreground">DB Latency</p>
          </div>
        </div>
      </Panel>
    </div>
  )
}
