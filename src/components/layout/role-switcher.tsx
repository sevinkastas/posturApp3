'use client'

import { ROLES, type Role } from '@/lib/roles'
import { useRole } from '@/lib/role-context'
import { cn } from '@/lib/utils'

const ORDER: Role[] = ['patient', 'physio']

export function RoleSwitcher({ className }: { className?: string }) {
  const { role, setRole } = useRole()

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/40 p-1',
        className,
      )}
      role="tablist"
      aria-label="Rol seçimi"
    >
      {ORDER.map((id) => {
        const meta = ROLES[id]
        const Icon = meta.icon
        const active = role === id
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setRole(id)}
            className={cn(
              'flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            <span className="truncate">{meta.shortLabel}</span>
          </button>
        )
      })}
    </div>
  )
}
