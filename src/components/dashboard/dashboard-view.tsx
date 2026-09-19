'use client'

import { useRole } from '@/lib/role-context'
import { planName } from '@/lib/session'
import { PatientDashboard } from './patient-dashboard'
import { PhysioDashboard } from './physio-dashboard'

export function DashboardView() {
  const { role, meta, user, isPremium } = useRole()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Merhaba, {user?.name ?? 'Kullanıcı'} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {meta.description} · Üyelik: {planName(user?.plan ?? 'free')}
          {isPremium ? ' (Premium)' : ''}
        </p>
      </div>
      {role === 'physio' ? <PhysioDashboard /> : <PatientDashboard />}
    </div>
  )
}
