import { CalendarDays, ClipboardList, TrendingUp, Users } from 'lucide-react'
import { StatCard } from './stat-card'
import { Panel } from './panel'
import { QuickActions } from './quick-actions'

const clients = [
  { name: 'Ahmet Yılmaz', focus: 'Servikal lordoz', score: 78, status: 'İyileşiyor' },
  { name: 'Zeynep Kaya', focus: 'Skolyoz takibi', score: 64, status: 'İzlemede' },
  { name: 'Mert Demir', focus: 'Omuz asimetrisi', score: 71, status: 'İyileşiyor' },
  { name: 'Elif Şahin', focus: 'Kifoz', score: 55, status: 'Dikkat' },
]

const appointments = [
  { time: '09:30', name: 'Ahmet Yılmaz', type: 'Kontrol' },
  { time: '11:00', name: 'Zeynep Kaya', type: 'İlk Analiz' },
  { time: '14:15', name: 'Mert Demir', type: 'Egzersiz Revizyonu' },
]

const statusTone: Record<string, string> = {
  İyileşiyor: 'bg-chart-3/10 text-chart-3',
  İzlemede: 'bg-primary/10 text-primary',
  Dikkat: 'bg-destructive/10 text-destructive',
}

export function PhysioDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Aktif Danışan"
          value="34"
          icon={Users}
          trend={{ direction: 'up', value: '4 yeni', positive: true }}
        />
        <StatCard
          label="Bugünkü Randevu"
          value="8"
          icon={CalendarDays}
          hint="3 tanesi öğleden önce"
        />
        <StatCard
          label="Bekleyen İnceleme"
          value="5"
          icon={ClipboardList}
          trend={{ direction: 'down', value: '2', positive: true }}
        />
        <StatCard
          label="Ort. İyileşme"
          value="+12"
          unit="%"
          icon={TrendingUp}
          trend={{ direction: 'up', value: '%3', positive: true }}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel
          title="Danışan Takibi"
          description="Son analiz skorlarına göre"
          className="lg:col-span-3"
        >
          <ul className="divide-y divide-border">
            {clients.map((client) => (
              <li key={client.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  {client.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{client.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{client.focus}</p>
                </div>
                <span
                  className={`hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline ${statusTone[client.status]}`}
                >
                  {client.status}
                </span>
                <span className="w-8 text-right text-sm font-semibold tabular-nums text-primary">
                  {client.score}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4 lg:col-span-2">
          <Panel title="Bugünün Randevuları">
            <ul className="space-y-3">
              {appointments.map((apt) => (
                <li key={apt.time} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-primary">
                    {apt.time}
                  </span>
                  <div className="min-w-0 flex-1 border-l border-border pl-3">
                    <p className="truncate text-sm font-medium">{apt.name}</p>
                    <p className="text-xs text-muted-foreground">{apt.type}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Hızlı Eylemler">
            <QuickActions
              actions={[
                {
                  label: 'Yeni Danışan',
                  description: 'Kayıt oluştur',
                  href: '/clients',
                  icon: Users,
                  accent: true,
                },
                {
                  label: 'İnceleme Kuyruğu',
                  description: '5 analiz bekliyor',
                  href: '/reviews',
                  icon: ClipboardList,
                },
              ]}
            />
          </Panel>
        </div>
      </div>
    </div>
  )
}
