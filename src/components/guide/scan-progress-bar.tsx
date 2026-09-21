'use client'
import Link from 'next/link'
import { Camera, Check, ChevronLeft, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GUIDE_STEPS_META } from '@/lib/guide-content'
import { useGuide } from '@/lib/guide-context'
export function ScanProgressBar({ compact = false }: { compact?: boolean }) {
  const g = useGuide()
  const done = [g.prepDone, g.angleDone, g.scanPhase !== 'idle', g.scanPhase === 'completed']
  if (compact) {
    return (
      <div className="flex items-center gap-2" aria-label="Tarama ilerlemesi">
        <div className="flex items-center gap-1" aria-hidden>
          {GUIDE_STEPS_META.map((m, i) => (
            <span
              key={m.step}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i + 1 < g.activeStep || done[i] ? 'w-6 bg-primary' : i + 1 === g.activeStep ? 'w-6 bg-chart-4' : 'w-4 bg-muted',
              )}
            />
          ))}
        </div>
        <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">%{g.progressPercent}</span>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-4" aria-label="Tarama adimlari">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ScanLine className="size-3.5" aria-hidden /> Tarama Barı
        </p>
        <span className="text-[11px] font-semibold tabular-nums text-primary">%{g.progressPercent} tamamlandı</span>
      </div>
      <ol className="mt-3 grid grid-cols-4 gap-1.5 sm:gap-2">
        {GUIDE_STEPS_META.map((m, i) => {
          const isDone = done[i]
          const isActive = g.activeStep === m.step
          return (
            <li key={m.step}>
              <button
                type="button"
                onClick={() => g.setActiveStep(m.step)}
                className={cn(
                  'flex w-full flex-col items-center gap-1 rounded-xl border px-1 py-2 text-center transition-colors',
                  isDone
                    ? 'border-chart-3/30 bg-chart-3/10'
                    : isActive
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-border bg-muted/30 hover:border-primary/30',
                )}
                aria-current={isActive ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex size-5 items-center justify-center rounded-full text-[10px] font-bold',
                    isDone ? 'bg-chart-3 text-white' : isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {isDone ? <Check className="size-3" aria-hidden /> : m.step}
                </span>
                <span className="text-[10px] font-medium leading-tight sm:text-[11px]">{m.shortLabel}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={g.progressPercent} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${g.progressPercent}%` }} />
      </div>
      {!g.canStartScan ? (
        <p className="mt-2.5 flex items-start gap-1.5 text-[11px] leading-snug text-chart-4">
          <Camera className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Kamerayı açmadan önce Hazırlık {!g.prepDone ? '(Adım 1)' : ''} ve Açı Seçimi {!g.prepDone ? '' : '(Adım 2)'} adımlarını tamamlayın.
        </p>
      ) : g.scanPhase === 'idle' ? (
        <p className="mt-2.5 text-[11px] leading-snug text-chart-3">Hazırsınız — kamerayı açıp taramayı başlatabilirsiniz.</p>
      ) : null}
      <div className="mt-3 flex items-center gap-2">
        <Link
          href="/scan"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <ScanLine className="size-3.5" aria-hidden /> Taramaya Git
        </Link>
        <button
          type="button"
          onClick={() => g.setActiveStep(g.activeStep > 1 ? ((g.activeStep - 1) as 1 | 2 | 3 | 4) : 1)}
          className="inline-flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" aria-hidden /> Geri
        </button>
      </div>
    </div>
  )
}
