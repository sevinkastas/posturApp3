import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  children: ReactNode
}

export function Panel({ title, description, action, className, children }: PanelProps) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card p-5', className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
