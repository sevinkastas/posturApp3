'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Camera, ChevronDown, Eye, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ANGLE_OPTIONS } from '@/lib/guide-content'
import { useGuide } from '@/lib/guide-context'
export function GuideStep2() {
  const g = useGuide()
  const [openId, setOpenId] = useState<string | null>('right')
  return (
    <div className="space-y-2.5">
      <p className="text-xs leading-snug text-muted-foreground">
        Doğru analiz için hangi açıyla duracağınızı seçin. Yan profil analizi için kameraya sağ ya da sol omzunuz dönük durun.
      </p>
      <ul className="space-y-2">
        {ANGLE_OPTIONS.map((a) => {
          const selected = g.selectedAngle === a.id
          const open = openId === a.id
          return (
            <li
              key={a.id}
              className={cn(
                'overflow-hidden rounded-xl border transition-colors',
                selected ? 'border-primary/50 bg-primary/5' : 'border-border bg-muted/30',
              )}
            >
              <div className="flex items-center gap-2 p-2.5">
                <button
                  type="button"
                  onClick={() => g.selectAngle(a.id)}
                  aria-pressed={selected}
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg',
                    selected ? 'bg-primary text-primary-foreground' : 'bg-card text-primary',
                  )}
                >
                  <Eye className="size-4" aria-hidden />
                </button>
                <button type="button" onClick={() => setOpenId(open ? null : a.id)} className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-xs font-semibold">{a.title}</span>
                  <span className="block truncate text-[11px] text-muted-foreground">{a.howTo}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : a.id)}
                  aria-label={a.title}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} aria-hidden />
                </button>
              </div>
              {open && (
                <div className="space-y-2 border-t border-border px-3 py-2.5">
                  <p className="text-[11px] leading-snug text-muted-foreground">Nasıl durmalısınız: {a.howTo}</p>
                  <p className="text-[11px] leading-snug text-primary">İpucu: {a.tip}</p>
                  <button
                    type="button"
                    onClick={() => g.selectAngle(a.id)}
                    className={cn(
                      'w-full rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors',
                      selected ? 'bg-chart-3/15 text-chart-3' : 'bg-primary/10 text-primary hover:bg-primary/20',
                    )}
                  >
                    {selected ? 'Seçildi' : 'Bu açıyla başla'}
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
export function GuideStep3() {
  const g = useGuide()
  const scanning = g.scanPhase === 'scanning' || g.scanPhase === 'framing'
  const pct =
    g.scanPosTotal > 0
      ? Math.round(((g.scanPosIndex + (g.scanPhase === 'scanning' ? 1 : 0)) / g.scanPosTotal) * 100)
      : 0
  return (
    <div className="space-y-3">
      {scanning ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <ScanLine className="size-4 animate-pulse" aria-hidden /> Sabit durun, veriler işleniyor...
          </p>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] tabular-nums text-muted-foreground">
            Pozisyon {Math.min(g.scanPosIndex + 1, g.scanPosTotal)} / {g.scanPosTotal} — iskelet eklemleri yakalanıyor.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-3 text-[11px] leading-snug text-muted-foreground">
          Tarama başladığında bu panel durum çubuğuna dönüşür; sistem iskelet eklemlerini yakalarken size anlık geri bildirim verir.
        </div>
      )}
      <Link
        href="/scan"
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
      >
        <Camera className="size-3.5" aria-hidden /> Tarama Ekranına Git
      </Link>
    </div>
  )
}
