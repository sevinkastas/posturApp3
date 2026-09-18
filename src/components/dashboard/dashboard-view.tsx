'use client'

import { useRole } from '@/lib/role-context'
import { PatientDashboard } from './patient-dashboard'
import { PhysioDashboard } from './physio-dashboard'

export function DashboardView() {
  const { role, meta } = useRole()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          Merhaba, {role === 'physio' ? 'Dr. Elif' : 'Ahmet'} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{meta.description}</p>
      </div>
      {role === 'physio' ? <PhysioDashboard /> : <PatientDashboard />}
    </div>
  )
}
