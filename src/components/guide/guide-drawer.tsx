'use client'
import { useEffect } from 'react'
import { BookOpen, Lightbulb, Play, X } from 'lucide-react'
import { GUIDE_TIPS, GUIDE_VIDEOS } from '@/lib/guide-content'
import { useGuide } from '@/lib/guide-context'
export function GuideDrawer() {
  const { drawerOpen, closeDrawer } = useGuide()
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, closeDrawer])
  if (!drawerOpen) return null
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Tarama rehberi">
      <button type="button" aria-label="Rehberi kapat" onClick={closeDrawer} className="absolute inset-0 bg-black/50" />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-card shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div>
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
              <BookOpen className="size-3.5" aria-hidden /> Nasıl Kullanılır?
            </p>
            <h2 className="mt-0.5 text-base font-semibold tracking-tight">Tarama Rehberi</h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Kapat"
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Video Anlatımlar</h3>
            <ul className="mt-2 space-y-2">
              {GUIDE_VIDEOS.map((v) => (
                <li key={v.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Play className="size-4" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-semibold">{v.title}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{v.description}</span>
                  </span>
                  <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">{v.duration}</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Lightbulb className="size-3.5" aria-hidden /> Kısa İpuçları
            </h3>
            <ul className="mt-2 space-y-2">
              {GUIDE_TIPS.map((tip) => (
                <li key={tip} className="rounded-xl border border-border bg-card p-3 text-[11px] leading-snug text-muted-foreground">
                  {tip}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  )
}
