'use client'

import { useState } from 'react'
import { Check, Shield } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { PREMIUM_PLANS } from '@/lib/roles'
import { cn } from '@/lib/utils'

export default function PremiumPage() {
  const { purchasePlan, user, isPremium } = useRole()
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)
  const [pending, setPending] = useState<string | null>(null)

  const buy = (planId: 'patient-premium' | 'physio-premium') => {
    setMessage(null)
    const result = purchasePlan(planId)
    if (!result.ok) {
      setMessage({ type: 'error', text: result.error ?? 'İşlem tamamlanamadı.' })
      if (result.pendingApproval) setPending(planId)
      return
    }
    setMessage({ type: 'ok', text: 'Ödeme başarıyla alındı! Premium özellikleriniz açıldı.' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Premium Üyelik</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isPremium
            ? 'Aktif premium üyeliğiniz bulunuyor — teşekkürler!'
            : 'Uzman onayı, canlı destek ve klinik panel için üyelik seçin.'}
        </p>
      </div>

      {message && (
        <div
          className={cn(
            'rounded-xl border p-3 text-sm',
            message.type === 'ok'
              ? 'border-chart-3/30 bg-chart-3/10 text-chart-3'
              : 'border-destructive/20 bg-destructive/10 text-destructive',
          )}
        >
          {message.text}
          {pending && (
            <p className="mt-1 text-xs opacity-80">
              Başvurunuz yönetici onay kuyruğuna iletildi; onay sonrası giriş yapabilirsiniz.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {PREMIUM_PLANS.map((plan) => {
          const isCurrent = user?.plan === plan.id
          return (
            <div
              key={plan.id}
              className={cn(
                'flex flex-col rounded-2xl border bg-card p-6 transition-colors',
                plan.id === 'physio-premium' ? 'border-primary/40' : 'border-border',
              )}
            >
              <div className="flex items-center gap-2">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Shield className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">{plan.description}</p>
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">{plan.period}</span>
              </div>

              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-chart-3" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                disabled={isCurrent}
                onClick={() => buy(plan.id)}
                className={cn(
                  'mt-5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
                  isCurrent
                    ? 'cursor-default bg-chart-3/10 text-chart-3'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                )}
              >
                {isCurrent ? 'Aktif Üyeliğiniz' : `Satın Al — ${plan.price}${plan.period}`}
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Demo notu: Ödeme akışı simüle edilir; gerçek bir ödeme sağlayıcısı entegre edilmediğinden
        ücret tahsil edilmez.
      </p>
    </div>
  )
}
