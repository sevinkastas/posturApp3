'use client'

import { Activity, ScanLine } from 'lucide-react'
import Link from 'next/link'
import { Panel } from '@/components/dashboard/panel'
import { ScoreRing } from '@/components/dashboard/score-ring'

interface PastAnalysis {
  id: string
  date: string
  area: string
  score: number
  status: 'Onaylandı' | 'İnceleniyor'
  parameters: { label: string; value: string; tone: 'good' | 'warn' | 'bad' }[]
  risks: { label: string; percent: number; level: string; tone: 'good' | 'warn' | 'bad' }[]
}

const analyses: PastAnalysis[] = [
  {
    id: 'an-1',
    date: '14 Eylül 2026',
    area: 'Tam Vücut',
    score: 82,
    status: 'Onaylandı',
    parameters: [
      { label: 'Omurga Eğriliği', value: 'Normal', tone: 'good' },
      { label: 'Omuz Hizası', value: 'Hafif Asimetri', tone: 'warn' },
      { label: 'Pelvik Eğim', value: 'Normal', tone: 'good' },
    ],
    risks: [
      { label: 'Servikal Postür Sendromu', percent: 12, level: 'Düşük', tone: 'good' },
      { label: 'Skolyoz Riski', percent: 8, level: 'Düşük', tone: 'good' },
      { label: 'Lombar Disk Yüklenmesi', percent: 34, level: 'Orta', tone: 'warn' },
    ],
  },
  {
    id: 'an-2',
    date: '07 Eylül 2026',
    area: 'Bel & Kalça',
    score: 68,
    status: 'Onaylandı',
    parameters: [
      { label: 'Pelvik Eğim', value: 'Hafif Anterior', tone: 'warn' },
      { label: 'Lombar Lordoz', value: 'Artmış', tone: 'warn' },
      { label: 'Kalça Dengesi', value: 'Normal', tone: 'good' },
    ],
    risks: [
      { label: 'Lombar Disk Yüklenmesi', percent: 46, level: 'Orta', tone: 'warn' },
      { label: 'Bel Fıtığı Riski', percent: 18, level: 'Düşük', tone: 'good' },
    ],
  },
  {
    id: 'an-3',
    date: '30 Ağustos 2026',
    area: 'Boyun & Omuz',
    score: 74,
    status: 'İnceleniyor',
    parameters: [
      { label: 'Öne Eğik Baş', value: 'Hafif', tone: 'warn' },
      { label: 'Yuvarlak Omuz', value: 'Var', tone: 'bad' },
      { label: 'Servikal Açı', value: 'Sınırlı', tone: 'warn' },
    ],
    risks: [
      { label: 'Servikal Postür Sendromu', percent: 41, level: 'Orta', tone: 'warn' },
      { label: 'Omuz Sıkışma Sendromu', percent: 27, level: 'Düşük', tone: 'good' },
    ],
  },
]

const paramTone = { good: 'text-chart-3', warn: 'text-chart-4', bad: 'text-destructive' } as const
const riskBar = { good: 'bg-chart-3', warn: 'bg-chart-4', bad: 'bg-destructive' } as const

export default function AnalysesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Analizlerim</h1>
          <p className="mt-1 text-sm text-muted-foreground">Geçmiş taramalarınız ve detaylı sonuçlar</p>
        </div>
        <Link
          href="/scan"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <ScanLine className="size-4" aria-hidden />
          Yeni Tarama
        </Link>
      </div>

      <div className="space-y-4">
        {analyses.map((item) => (
          <Panel key={item.id} title={`${item.area} Taraması`} description={item.date}>
            <div className="grid gap-6 md:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center gap-2">
                <ScoreRing value={item.score} size={112} />
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    item.status === 'Onaylandı' ? 'bg-chart-3/10 text-chart-3' : 'bg-chart-4/10 text-chart-4'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Activity className="size-3.5" aria-hidden />
                    Detaylı Parametreler
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {item.parameters.map((p) => (
                      <div key={p.label} className="rounded-lg bg-muted/40 p-2.5 text-xs">
                        <p className="text-muted-foreground">{p.label}</p>
                        <p className={`mt-0.5 font-semibold ${paramTone[p.tone]}`}>{p.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Öngörülen Patoloji ve Risk Oranları
                  </p>
                  <div className="space-y-2.5">
                    {item.risks.map((r) => (
                      <div key={r.label}>
                        <div className="mb-1 flex justify-between text-xs font-medium">
                          <span>{r.label}</span>
                          <span className={paramTone[r.tone]}>
                            {r.percent}% ({r.level})
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div className={`h-full rounded-full ${riskBar[r.tone]}`} style={{ width: `${r.percent}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
