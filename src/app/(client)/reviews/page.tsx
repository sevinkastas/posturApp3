'use client'

import { useState } from 'react'
import { Check, Pencil, ShieldCheck, Sparkles, Play } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { useExercisePool } from '@/lib/use-exercise-pool'
import { cn } from '@/lib/utils'

/** Yapay zekanın ürettiği ölçüm + otomatik atanan program (demo) */
const AI_ITEMS = [
  {
    id: 'ai-1',
    client: 'Ahmet Yılmaz',
    date: '14 Eylül',
    confidence: 92,
    measurements: [
      { label: 'Omurga Eğriliği', value: 'Normal (3°)' },
      { label: 'Servikal Açı', value: '48°' },
      { label: 'Pelvik Eğim', value: 'Dengeli' },
    ],
    programIds: ['ex-1', 'ex-2'],
  },
  {
    id: 'ai-2',
    client: 'Zeynep Kaya',
    date: '12 Eylül',
    confidence: 87,
    measurements: [
      { label: 'Skolyoz Açısı', value: '9° Cobb' },
      { label: 'Omuz Hizası', value: 'Hafif asimetri' },
    ],
    programIds: ['ex-3', 'ex-4'],
  },
  {
    id: 'ai-3',
    client: 'Elif Şahin',
    date: '08 Eylül',
    confidence: 78,
    measurements: [
      { label: 'Torakal Kifoz', value: 'Artmış' },
      { label: 'Esneklik', value: 'Kısıtlı' },
    ],
    programIds: ['ex-5', 'ex-6'],
  },
]

type ReviewStatus = 'approved' | 'revised'

interface ReviewState {
  status: ReviewStatus
  note: string
}

const DIFF_TONE: Record<string, string> = {
  Kolay: 'bg-chart-3/10 text-chart-3',
  Orta: 'bg-chart-4/10 text-chart-4',
  Zor: 'bg-destructive/10 text-destructive',
}

/**
 * Fizyoterapist / AI Analiz Onayı — yapay zekanın ölçümlerini ve havuzdan
 * otomatik atanan egzersiz programını klinik gözle inceler, onaylar veya revize eder.
 */
export default function ReviewsPage() {
  const { pool } = useExercisePool()
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')

  const getExercise = (id: string) => pool.find((e) => e.id === id)

  const decide = (id: string, status: ReviewStatus) => {
    setReviews((prev) => ({ ...prev, [id]: { status, note: draft.trim() } }))
    setActiveId(null)
    setDraft('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">AI Analiz Onayı</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Yapay zekanın yaptığı ölçümleri ve otomatik atanan egzersiz programını klinik gözle inceleyin,
          gerekirse danışanın durumuna göre revize edin.
        </p>
      </div>

      <div className="space-y-4">
        {AI_ITEMS.map((item) => {
          const state = reviews[item.id]
          const canDecide = activeId === item.id
          return (
            <Panel
              key={item.id}
              title={`${item.client} — ${item.date}`}
              description={`AI güven skoru: %${item.confidence}`}
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Ölçümleri
                  </span>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {item.measurements.map((m) => (
                    <div key={m.label} className="rounded-lg bg-muted/40 p-2.5 text-xs">
                      <p className="text-muted-foreground">{m.label}</p>
                      <p className="mt-0.5 font-semibold text-foreground">{m.value}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Havuzdan Otomatik Atanan Program
                  </span>
                </div>
                <div className="space-y-2.5">
                  {item.programIds.map((exId) => {
                    const ex = getExercise(exId)
                    if (!ex) {
                      return (
                        <p key={exId} className="text-xs text-muted-foreground">
                          Egzersiz havuzda bulunamadı: {exId}
                        </p>
                      )
                    }
                    return (
                      <div key={exId} className="rounded-xl border border-border bg-muted/30 p-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Play className="size-4" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">{ex.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {ex.targetMuscle} · {ex.duration}
                            </p>
                          </div>
                          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', DIFF_TONE[ex.difficulty])}>
                            {ex.difficulty}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{ex.description}</p>
                      </div>
                    )
                  })}
                </div>

                {state && (
                  <div className="rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Karar: {state.status === 'approved' ? 'Onaylandı' : 'Revize edildi'}
                    </p>
                    {state.note && <p className="mt-1 text-xs text-muted-foreground">{state.note}</p>}
                  </div>
                )}

                {canDecide && (
                  <div className="space-y-2 rounded-xl border border-border bg-muted/30 p-3">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={3}
                      placeholder="Klinik not veya revizyon açıklaması..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => decide(item.id, 'approved')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-chart-3/10 px-3 py-2 text-xs font-semibold text-chart-3 hover:bg-chart-3/20"
                      >
                        <Check className="size-3" aria-hidden />
                        Ölçüm ve Programı Onayla
                      </button>
                      <button
                        type="button"
                        onClick={() => decide(item.id, 'revised')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/20"
                      >
                        <Pencil className="size-3" aria-hidden />
                        Revize Et
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(null)
                          setDraft('')
                        }}
                        className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                {!canDecide && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(item.id)
                      setDraft(state?.note ?? '')
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <ShieldCheck className="size-3" aria-hidden />
                    {state ? 'Yeniden Değerlendir' : 'İncele ve Onayla'}
                  </button>
                )}
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}

