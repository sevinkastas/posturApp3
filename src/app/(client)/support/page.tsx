'use client'

import { useState } from 'react'
import { Lock, MessageSquarePlus, Send, Shield, Stethoscope } from 'lucide-react'
import Link from 'next/link'
import { Panel } from '@/components/dashboard/panel'
import { useRole } from '@/lib/role-context'
import { useSupportTickets } from '@/lib/use-support-tickets'
import { createTicket } from '@/lib/support-tickets'
import { cn } from '@/lib/utils'

const SESSION_FEE = 250

export default function SupportPage() {
  const { role, user, isPremium } = useRole()
  const { tickets, setStatus, reply } = useSupportTickets()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [category, setCategory] = useState<'görüşme' | 'teknik' | 'geri-bildirim'>('görüşme')
  const [sent, setSent] = useState(false)
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({})

  // Ücretsiz danışan: kilitli ekran
  if (!isPremium && role === 'patient') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Canlı Destek</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fizyoterapist görüşmesi (premium)</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary neon-glow">
            <Lock className="size-7" aria-hidden />
          </span>
          <p className="mt-4 text-sm font-medium">Canlı destek premium üyelere özeldir</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Uzman görüşmeleri, öncelikli inceleme ve revize program için Danışan Premium&apos;a geçin.
          </p>
          <Link
            href="/premium"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <Shield className="size-4" aria-hidden />
            Premium&apos;a Geç — ₺149/ay
          </Link>
        </div>
      </div>
    )
  }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    createTicket({
      userName: user.name,
      userEmail: user.email,
      subject,
      message,
      category,
      sessionFee: category === 'görüşme' ? SESSION_FEE : undefined,
    })
    setSubject('')
    setMessage('')
    setSent(true)
  }

  const relevant =
    role === 'physio'
      ? tickets.filter((t) => t.category === 'görüşme' || t.category === 'teknik')
      : tickets.filter((t) => t.userEmail.toLowerCase() === (user?.email ?? '').toLowerCase())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Canlı Destek</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {role === 'physio'
            ? 'Gelen görüşme talepleri ve ücretli destek yönetimi'
            : 'Uzman görüşmesi talep edin veya destek ekibine yazın'}
        </p>
      </div>

      {role === 'patient' && (
        <Panel title="Yeni Talep" description="Görüşme ücreti: ₺250 / 30 dk">
          <form onSubmit={submit} className="space-y-3">
            <div className="flex gap-2">
              {(['görüşme', 'teknik', 'geri-bildirim'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={cn(
                    'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                    category === c
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground',
                  )}
                >
                  {c === 'görüşme' ? 'Uzman Görüşmesi' : c === 'teknik' ? 'Teknik Sorun' : 'Geri Bildirim'}
                </button>
              ))}
            </div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Konu"
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Açıklama..."
              required
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Send className="size-4" aria-hidden />
              Gönder
            </button>
            {sent && <p className="text-xs text-chart-3">Talebiniz iletildi. En kısa sürede dönüş yapılacak.</p>}
          </form>
        </Panel>
      )}
      <div className="space-y-4">
        {relevant.length === 0 && (
          <Panel title="Talepler" description="Henüz bir destek talebi yok">
            <p className="text-sm text-muted-foreground">Burada görünecek.</p>
          </Panel>
        )}
        {relevant.map((ticket) => (
          <Panel
            key={ticket.id}
            title={ticket.subject}
            description={`${ticket.userName} · ${new Date(ticket.createdAt).toLocaleDateString('tr-TR')}${ticket.sessionFee ? ` · ₺${ticket.sessionFee}` : ''}`}
          >
            <p className="text-sm text-muted-foreground">{ticket.message}</p>
            {ticket.replies.map((r, i) => (
              <div key={i} className="mt-3 rounded-xl bg-muted/40 p-3 text-xs">
                <p className="font-medium">
                  {r.author} <span className="text-muted-foreground">· {new Date(r.at).toLocaleString('tr-TR')}</span>
                </p>
                <p className="mt-1 text-muted-foreground">{r.message}</p>
              </div>
            ))}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-[11px] font-medium',
                  ticket.status === 'open'
                    ? 'bg-chart-4/10 text-chart-4'
                    : ticket.status === 'resolved'
                      ? 'bg-chart-3/10 text-chart-3'
                      : 'bg-primary/10 text-primary',
                )}
              >
                {ticket.status === 'open' ? 'Açık' : ticket.status === 'resolved' ? 'Çözüldü' : 'İşlemde'}
              </span>

              {role === 'physio' && ticket.status !== 'resolved' && (
                <>
                  <input
                    value={replyDraft[ticket.id] ?? ''}
                    onChange={(e) => setReplyDraft({ ...replyDraft, [ticket.id]: e.target.value })}
                    placeholder="Yanıt yazın..."
                    className="min-w-48 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const text = replyDraft[ticket.id]
                      if (!text?.trim()) return
                      reply(ticket.id, user?.name ?? 'Uzman', 'physio', text)
                      setReplyDraft({ ...replyDraft, [ticket.id]: '' })
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <MessageSquarePlus className="size-3.5" aria-hidden />
                    Yanıtla
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(ticket.id, 'resolved')}
                    className="rounded-lg bg-chart-3/10 px-3 py-2 text-xs font-semibold text-chart-3"
                  >
                    Çözüldü
                  </button>
                </>
              )}
            </div>
          </Panel>
        ))}
      </div>

      {role === 'physio' && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Stethoscope className="size-3.5" aria-hidden />
          Çözülen görüşme başlığı başına ₺250 kazanç hesabınıza tanımlanır.
        </p>
      )}
    </div>
  )
}
