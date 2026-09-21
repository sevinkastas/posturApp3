'use client'
import Link from 'next/link'
import { ArrowRight, RotateCcw, ScanLine } from 'lucide-react'
import { GuideStep1, GuideHeader } from './guide-steps'
import { GuideStep2, GuideStep3 } from './guide-steps-2'
import { useGuide } from '@/lib/guide-context'
export function GuideStep4() {
  const g = useGuide()
  const done = g.scanPhase === 'completed'
  return (
    <div className="space-y-3">
      {done ? (
        <div className="rounded-xl border border-chart-3/30 bg-chart-3/10 p-3">
          <p className="text-xs font-semibold text-chart-3">
            Tarama tamamlandı{g.lastScore !== null ? ` — skorunuz: ${g.lastScore}` : ''}.
          </p>
          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
            Risk skorlarınız hazır. Egzersiz programınıza yönlendiriliyorsunuz:
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-[11px] leading-snug text-muted-foreground">
          Tarama tamamlandığında kılavuz sizi otomatik olarak risk skorlarınıza ve havuzdan atanan egzersiz programınıza yönlendirir.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/analyses"
          className="inline-flex items-center justify-center gap-1 rounded-xl border border-border px-3 py-2 text-[11px] font-semibold hover:border-primary/40 hover:text-primary"
        >
          Risk Skorlarım <ArrowRight className="size-3.5" aria-hidden />
        </Link>
        <Link
          href="/exercises"
          className="inline-flex items-center justify-center gap-1 rounded-xl bg-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Egzersiz Programım <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  )
}
export function GuideFooter() {
  const g = useGuide()
  return (
    <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
      <button
        type="button"
        onClick={g.prevStep}
        disabled={g.activeStep === 1}
        className="rounded-lg border border-border px-3 py-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
      >
        Geri
      </button>
      <span className="text-[11px] tabular-nums text-muted-foreground">%{g.progressPercent} tamamlandı</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={g.resetGuide}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          title="Kılavuzu sıfırla"
        >
          <RotateCcw className="size-3.5" aria-hidden /> Sıfırla
        </button>
        {g.activeStep < 4 ? (
          <button
            type="button"
            onClick={g.nextStep}
            className="rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Devam Et
          </button>
        ) : (
          <button
            type="button"
            onClick={g.openDrawer}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary hover:bg-primary/20"
          >
            Rehberi Aç
          </button>
        )}
      </div>
    </div>
  )
}
export function GuideCollapsedBar() {
  const g = useGuide()
  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground" role="status">
      <ScanLine className="size-3.5 animate-pulse text-primary" aria-hidden />
      {g.scanPhase === 'scanning'
        ? 'Sabit durun, veriler işleniyor...'
        : g.scanPhase === 'completed'
          ? 'Tarama tamamlandı — sonuçlara göz atın.'
          : `Adım ${g.activeStep}/4 — kaldığınız yerden devam edin.`}
    </div>
  )
}
export function GuidePanel({ variant = 'card' }: { variant?: 'card' | 'embedded' }) {
  const g = useGuide()
  return (
    <section
      aria-label="Yonlendirme asistani"
      className={variant === 'card' ? 'rounded-2xl border border-border bg-card p-5' : ''}
    >
      <GuideHeader onToggle={g.toggleCollapsed} />
      {!g.collapsed && (
        <div className="mt-4">
          {g.activeStep === 1 && <GuideStep1 />}
          {g.activeStep === 2 && <GuideStep2 />}
          {g.activeStep === 3 && <GuideStep3 />}
          {g.activeStep === 4 && <GuideStep4 />}
          <GuideFooter />
        </div>
      )}
      {g.collapsed && <GuideCollapsedBar />}
    </section>
  )
}
