'use client'
import { Check, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GUIDE_STEPS_META, PREP_CHECKLIST } from '@/lib/guide-content'
import { useGuide } from '@/lib/guide-context'
export function GuideStepDots() {
  const g = useGuide()
  return (
    <ol className="flex items-center gap-1.5" aria-label="Kilavuz adimlari">
      {GUIDE_STEPS_META.map((m) => {
        const done =
          m.step < g.activeStep ||
          (m.step === 1 && g.prepDone) ||
          (m.step === 2 && g.angleDone) ||
          (m.step === 4 && g.scanPhase === 'completed')
        const active = m.step === g.activeStep
        return (
          <li key={m.step}>
            <button
              type="button"
              onClick={() => g.setActiveStep(m.step)}
              title={m.title}
              aria-current={active ? 'step' : undefined}
              className={cn(
                'flex size-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                done
                  ? 'bg-chart-3 text-white'
                  : active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {done ? <Check className="size-3.5" aria-hidden /> : m.step}
            </button>
          </li>
        )
      })}
    </ol>
  )
}
export function GuideStep1() {
  const g = useGuide()
  return (
    <div className="space-y-2.5">
      <p className="text-xs leading-snug text-muted-foreground">
        Kameranın karşısında nasıl durmanız gerektiğini kontrol edin. Tüm maddeler işaretlenmeden kamera açılmaz.
      </p>
      <ul className="space-y-2">
        {PREP_CHECKLIST.map((item) => {
          const checked = !!g.prepChecks[item.id]
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => g.togglePrep(item.id)}
                aria-pressed={checked}
                className={cn(
                  'flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition-colors',
                  checked ? 'border-chart-3/40 bg-chart-3/10' : 'border-border bg-muted/30 hover:border-primary/40',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border',
                    checked ? 'border-chart-3 bg-chart-3 text-white' : 'border-border bg-background',
                  )}
                >
                  {checked && <Check className="size-3.5" aria-hidden />}
                </span>
                <span>
                  <span className="block text-xs font-medium leading-snug">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{item.hint}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {g.prepDone && (
        <p className="rounded-lg bg-chart-3/10 px-3 py-2 text-[11px] font-medium text-chart-3">
          Hazırlık tamam — 2. adıma geçebilirsiniz.
        </p>
      )}
    </div>
  )
}
export function GuideHeader({ onToggle }: { onToggle: () => void }) {
  const g = useGuide()
  const meta = GUIDE_STEPS_META[g.activeStep - 1]
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
          <Sparkles className="size-3.5" aria-hidden /> Yönlendirme Asistanı
        </p>
        <h2 className="mt-1 text-sm font-semibold tracking-tight">
          Adım {g.activeStep}: {meta.title}
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{meta.description}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <GuideStepDots />
        <button
          type="button"
          onClick={onToggle}
          className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
          aria-expanded={!g.collapsed}
        >
          {g.collapsed ? 'Genişlet' : 'Küçült'}
        </button>
      </div>
    </div>
  )
}
