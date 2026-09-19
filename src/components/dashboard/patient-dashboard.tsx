import Link from 'next/link'
import { Activity, Dumbbell, HeartPulse, ScanLine, Stethoscope, Target } from 'lucide-react'
import { ScoreRing } from './score-ring'
import { StatCard } from './stat-card'
import { Panel } from './panel'
import { QuickActions } from './quick-actions'

const analyses = [
  { date: '14 Eyl', area: 'Boyun & Omuz', score: 82, note: 'İyi hizalama' },
  { date: '07 Eyl', area: 'Bel & Kalça', score: 68, note: 'Hafif eğim' },
  { date: '30 Ağu', area: 'Tam Vücut', score: 74, note: 'Gelişme var' },
]

export function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex items-center gap-5 rounded-2xl border border-border bg-card p-6 lg:col-span-1">
          <ScoreRing value={78} label="Postür Skoru" />
          <div>
            <p className="text-sm font-medium">Genel Durum</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">
              Postürün son 30 günde <span className="text-chart-3">%6 iyileşti</span>. Egzersizlere
              devam et.
            </p>
            <Link
              href="/scan"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              <ScanLine className="size-3.5" aria-hidden />
              Yeni Tarama
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard
            label="Bu Ayki Tarama"
            value="12"
            icon={Activity}
            trend={{ direction: 'up', value: '%20', positive: true }}
          />
          <StatCard
            label="Tamamlanan Egzersiz"
            value="48"
            unit="/ 60"
            icon={Dumbbell}
            trend={{ direction: 'up', value: '%15', positive: true }}
          />
          <StatCard
            label="Ağrı Seviyesi"
            value="2.4"
            unit="/ 10"
            icon={HeartPulse}
            trend={{ direction: 'down', value: '%30', positive: true }}
          />
          <StatCard
            label="Hedef İlerleme"
            value="65"
            unit="%"
            icon={Target}
            hint="Aylık hedefe 35% kaldı"
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel
          title="Hızlı Eylemler"
          description="Sık kullanılan işlemler"
          className="lg:col-span-3"
        >
          <QuickActions
            actions={[
              {
                label: 'Postür Taraması Başlat',
                description: '360° kamera analizi',
                href: '/scan',
                icon: ScanLine,
                accent: true,
              },
              {
                label: 'Egzersiz Programım',
                description: 'Günlük 12 dk rutin',
                href: '/exercises',
                icon: Dumbbell,
              },
              {
                label: 'Analiz Geçmişi',
                description: 'Skorları karşılaştır',
                href: '/analyses',
                icon: Activity,
              },
              {
                label: 'Sağlık Hedeflerim',
                description: 'İlerlemeyi gör',
                href: '/profile',
                icon: Target,
              },
              {
                label: 'Uzman / Canlı Destek',
                description: 'Fizyoterapist görüşmesi',
                href: '/support',
                icon: Stethoscope,
              },
            ]}
          />
        </Panel>

        <Panel title="Son Analizler" className="lg:col-span-2">
          <ul className="space-y-3">
            {analyses.map((item) => (
              <li
                key={item.date}
                className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3"
              >
                <span className="flex w-12 shrink-0 flex-col items-center rounded-lg bg-card py-1.5 text-center">
                  <span className="text-[10px] uppercase text-muted-foreground">
                    {item.date.split(' ')[1]}
                  </span>
                  <span className="text-sm font-semibold leading-none">
                    {item.date.split(' ')[0]}
                  </span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.area}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums text-primary">
                  {item.score}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
