import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatCardProps {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  trend?: { direction: 'up' | 'down'; value: string; positive?: boolean }
  hint?: string
}

export function StatCard({ label, value, unit, icon: Icon, trend, hint }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        {trend && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trend.positive ?? trend.direction === 'up'
                ? 'bg-chart-3/10 text-chart-3'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="size-3.5" aria-hidden />
            ) : (
              <TrendingDown className="size-3.5" aria-hidden />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-semibold tracking-tight tabular-nums">{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
