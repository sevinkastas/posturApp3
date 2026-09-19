'use client'

import { useMemo, useState } from 'react'
import { Mail, MapPin, Phone, Search, TrendingUp } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { CLIENTS, type ClientRecord } from '@/lib/clients-data'

const statusTone: Record<ClientRecord['status'], string> = {
  İyileşiyor: 'bg-chart-3/10 text-chart-3',
  İzlemede: 'bg-primary/10 text-primary',
  Dikkat: 'bg-destructive/10 text-destructive',
}

export default function ClientsPage() {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(CLIENTS[0].id)

  const filtered = useMemo(
    () =>
      CLIENTS.filter((c) =>
        (c.name + c.email + c.city).toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')),
      ),
    [query],
  )

  const selected = CLIENTS.find((c) => c.id === selectedId) ?? CLIENTS[0]
  const delta = selected.progress[selected.progress.length - 1].score - selected.progress[0].score

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Danışan Portföyü</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Kliniğe bağlı danışanlar, iletişim bilgileri ve son tarama sonuçları
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Danışan ara (isim, e-posta, şehir)..."
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Panel title="Danışanlar" description={`${filtered.length} kayıt`} className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`flex w-full items-center gap-3 py-3 text-left ${c.id === selectedId ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                    }`}
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                    {c.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.city} · Son tarama: {c.lastScan.date}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusTone[c.status]}`}>
                    {c.status}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-4 lg:col-span-3">
          <Panel title={selected.name} description={`İletişim · ${selected.status}`}>
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <p className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                <Mail className="size-3.5 text-primary" aria-hidden />
                {selected.email}
              </p>
              <p className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                <Phone className="size-3.5 text-primary" aria-hidden />
                {selected.phone}
              </p>
              <p className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs">
                <MapPin className="size-3.5 text-primary" aria-hidden />
                {selected.city}
              </p>
            </div>
          </Panel>

          <Panel title="Son Tarama Sonuçları" description={`Sistem taraması · ${selected.lastScan.date}`}>
            <div className="flex items-center gap-5">
              <span className="flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="text-2xl font-bold tabular-nums">{selected.lastScan.score}</span>
                <span className="text-[10px]">/100</span>
              </span>
              <ul className="flex-1 space-y-2 text-xs">
                {selected.lastScan.metrics.map((m) => (
                  <li key={m.label} className="flex justify-between rounded-lg bg-muted/40 px-3 py-2">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold">{m.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Panel>

          <Panel title="İlerleme Eğrisi" description="Son 4 ay skor gelişimi">
            <div className="flex h-32 items-end gap-3">
              {selected.progress.map((p) => (
                <div key={p.month} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[11px] font-semibold tabular-nums text-primary">{p.score}</span>
                  <div className="w-full rounded-t-lg bg-primary/20" style={{ height: `${p.score}%` }} />
                  <span className="text-[10px] text-muted-foreground">{p.month}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5 text-chart-3" aria-hidden />
              Genel değişim: {delta > 0 ? `+${delta}` : delta} puan
            </p>
          </Panel>
        </div>
      </div>
    </div>
  )
}
