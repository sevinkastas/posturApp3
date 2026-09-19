'use client'

import { useState } from 'react'
import { Check, X, Search, Trash2, Ban, RotateCcw } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { useRegistry } from '@/lib/use-registry'
import { removeUser } from '@/lib/registry-store'
import type { RegistryUser } from '@/lib/registry-types'
import { cn } from '@/lib/utils'

/**
 * Admin / Kullanıcı Onayı — yeni fizyoterapist başvurularını onaylar,
 * rolleri ve planlarını yönetir.
 */
export default function AdminUsersPage() {
  const { users, approve, reject, suspend, setRolePlan, refresh } = useRegistry()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'suspended'>('pending')
  const [actionNote, setActionNote] = useState<Record<string, string>>({})

  const filtered = users.filter(
    (u) =>
      u.role === 'physio' &&
      (filter === 'all' || u.status === filter) &&
      (u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase()) ||
        (u.licenseNo ?? '').toLowerCase().includes(query.toLowerCase())),
  )

function handleApprove(id: string) {
    approve(id, actionNote[id] || 'Onaylandı')
  }

  const handleReject = (id: string) => {
    reject(id, actionNote[id] || 'Reddedildi')
  }

  const handleSuspend = (id: string) => {
    suspend(id, actionNote[id] || 'Askıya alındı')
  }

  const handleRemove = (id: string) => {
    removeUser(id)
    refresh()
  }

  const statusConfig = {
    pending: { label: 'Bekliyor', tone: 'bg-chart-4/10 text-chart-4' },
    approved: { label: 'Onaylı', tone: 'bg-chart-3/10 text-chart-3' },
    rejected: { label: 'Reddedildi', tone: 'bg-destructive/10 text-destructive' },
    suspended: { label: 'Askıda', tone: 'bg-muted text-muted-foreground' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Kullanıcı Onayı</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fizyoterapist başvurularını onaylayın ve rol yetkilerini yönetin</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="İsim, e-posta veya lisans no ara..." className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['pending', 'approved', 'rejected', 'suspended', 'all'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setFilter(s)} className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors', filter === s ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground')}>
              {s === 'all' ? 'Tümü' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      <Panel title="Fizyoterapist Başvuruları" description={`${filtered.length} kayıt`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 font-medium text-muted-foreground">Ad Soyad</th>
                <th className="pb-2 font-medium text-muted-foreground">İletişim</th>
                <th className="pb-2 font-medium text-muted-foreground">Lisans</th>
                <th className="pb-2 font-medium text-muted-foreground">Durum</th>
                <th className="pb-2 font-medium text-muted-foreground">Paket</th>
                <th className="pb-2 font-medium text-muted-foreground">Başvuru</th>
                <th className="pb-2 text-right font-medium text-muted-foreground">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-border/50">
                  <td className="py-3 font-medium">{u.name}</td>
                  <td className="py-3 text-muted-foreground">{u.email}<br />{u.phone}</td>
                  <td className="py-3">{u.licenseNo ?? '—'}</td>
                  <td className="py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', statusConfig[u.status].tone)}>{statusConfig[u.status].label}</span>
                  </td>
                  <td className="py-3 text-muted-foreground">{new Date(u.requestedAt).toLocaleDateString('tr-TR')}</td>
                  <td className="py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', u.plan === 'physio-premium' ? 'bg-chart-3/10 text-chart-3' : 'bg-muted text-muted-foreground')}>
                      {u.plan === 'physio-premium' ? 'Uzman paketi' : 'Paket yok'}
                    </span>
                  </td>
                                    <td className="py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      {u.status === 'pending' && (
                        <>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => handleApprove(u.id)} className="rounded-md p-1 text-chart-3 hover:bg-chart-3/10" title="Onayla"><Check className="size-3.5" aria-hidden /></button>
                            <button type="button" onClick={() => handleReject(u.id)} className="rounded-md p-1 text-destructive hover:bg-destructive/10" title="Reddet"><X className="size-3.5" aria-hidden /></button>
                          </div>
                          <input
                            value={actionNote[u.id] ?? ''}
                            onChange={(e) => setActionNote({ ...actionNote, [u.id]: e.target.value })}
                            placeholder="Not..."
                            className="w-32 rounded border border-border bg-background px-1.5 py-1 text-[9px] outline-none focus:border-primary"
                          />
                        </>
                      )}
                      {u.status === 'approved' && (
                        <>
                          <select
                            value={u.plan}
                            onChange={(e) => setRolePlan(u.id, e.target.value as RegistryUser['plan'])}
                            title="Paket yetkisi (rol yetkilendirmesi)"
                            className="rounded border border-border bg-background px-1.5 py-1 text-[9px] outline-none focus:border-primary"
                          >
                            <option value="free">Paket yok</option>
                            <option value="physio-premium">Uzman paketi</option>
                          </select>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => handleSuspend(u.id)} className="rounded-md p-1 text-chart-4 hover:bg-chart-4/10" title="Askıya al"><Ban className="size-3.5" aria-hidden /></button>
                            <button type="button" onClick={() => handleRemove(u.id)} className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Kullanıcıyı kaldır"><Trash2 className="size-3.5" aria-hidden /></button>
                          </div>
                        </>
                      )}
                      {u.status === 'suspended' && (
                        <button type="button" onClick={() => handleApprove(u.id)} className="inline-flex items-center gap-1 rounded-md bg-chart-3/10 px-2 py-1 text-[9px] font-medium text-chart-3" title="Yeniden etkinleştir"><RotateCcw className="size-3" aria-hidden />Etkinleştir</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Kayıt bulunamadı.</p>}
        </div>
      </Panel>
    </div>
  )
}
