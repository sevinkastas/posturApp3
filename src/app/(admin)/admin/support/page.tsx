'use client'

import { useState } from 'react'
import { Search, Check, MessageSquarePlus } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { useSupportTickets } from '@/lib/use-support-tickets'
import { useRole } from '@/lib/role-context'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  open: { label: 'Açık', tone: 'bg-chart-4/10 text-chart-4' },
  'in-progress': { label: 'İşlemde', tone: 'bg-primary/10 text-primary' },
  resolved: { label: 'Çözüldü', tone: 'bg-chart-3/10 text-chart-3' },
} as const

const CATEGORY_LABEL: Record<string, string> = {
  teknik: 'Teknik',
  'geri-bildirim': 'Geri Bildirim',
  'görüşme': 'Görüşme',
  faturalama: 'Faturalama',
}

/**
 * Admin / Destek Talepleri — kullanıcıların sistemle ilgili yaşadığı teknik
 * aksaklıkları ve geri bildirimleri inceleyip çözüm üretir.
 */
export default function AdminSupportPage() {
  const { user } = useRole()
  const { tickets, setStatus, reply } = useSupportTickets()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'resolved'>('all')
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})

  const filtered = tickets.filter(
    (t) =>
      (statusFilter === 'all' || t.status === statusFilter) &&
      (t.subject.toLowerCase().includes(query.toLowerCase()) ||
        t.userName.toLowerCase().includes(query.toLowerCase()) ||
        t.message.toLowerCase().includes(query.toLowerCase())),
  )

  const handleReply = (id: string) => {
    const text = replyDraft[id]
    if (!text?.trim()) return
    reply(id, user?.name ?? 'Sistem Yöneticisi', 'admin', text)
    setReplyDraft({ ...replyDraft, [id]: '' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Destek Talepleri</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kullanıcı teknik aksaklıklarını ve geri bildirimlerini yönetin
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Talep ara..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'open', 'in-progress', 'resolved'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                statusFilter === s
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground',
              )}
            >
              {s === 'all' ? 'Tümü' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((t) => (
          <Panel
            key={t.id}
            title={t.subject}
            description={`${t.userName} · ${new Date(t.createdAt).toLocaleDateString('tr-TR')}`}
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', STATUS_CONFIG[t.status].tone)}>
                  {STATUS_CONFIG[t.status].label}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">
                  {CATEGORY_LABEL[t.category] ?? t.category}
                </span>
                {t.sessionFee && <span className="text-muted-foreground">Ücret: ₺{t.sessionFee}</span>}
              </div>

              <p className="text-sm text-muted-foreground">{t.message}</p>

              {t.replies.map((r, i) => (
                <div key={i} className="rounded-xl bg-muted/40 p-3 text-xs">
                  <p className="font-medium">
                    {r.author}{' '}
                    <span className="text-muted-foreground">· {new Date(r.at).toLocaleString('tr-TR')}</span>
                  </p>
                  <p className="mt-1 text-muted-foreground">{r.message}</p>
                </div>
              ))}

              {t.status !== 'resolved' && (
                <div className="flex flex-col gap-2 pt-2">
                  <textarea
                    value={replyDraft[t.id] ?? ''}
                    onChange={(e) => setReplyDraft({ ...replyDraft, [t.id]: e.target.value })}
                    placeholder="Yönetici yanıtı yazın..."
                    rows={3}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleReply(t.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                    >
                      <MessageSquarePlus className="size-3" aria-hidden />
                      Yanıtla
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus(t.id, t.status === 'open' ? 'in-progress' : 'resolved')}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      <Check className="size-3" aria-hidden />
                      {t.status === 'open' ? 'İşleme Al' : 'Çözüldü'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground">Görüntülenecek destek talebi yok.</p>
        )}
      </div>
    </div>
  )
}
