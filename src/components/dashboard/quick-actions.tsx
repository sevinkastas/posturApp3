import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuickAction {
  label: string
  description: string
  href: string
  icon: LucideIcon
  accent?: boolean
}

export function QuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.href + action.label}
            href={action.href}
            className={cn(
              'group flex items-center gap-4 rounded-xl border p-4 transition-colors',
              action.accent
                ? 'border-primary/40 bg-primary/10 hover:bg-primary/15'
                : 'border-border bg-muted/30 hover:border-primary/40',
            )}
          >
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl',
                action.accent ? 'bg-primary text-primary-foreground neon-glow' : 'bg-card text-primary',
              )}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="truncate text-xs text-muted-foreground">{action.description}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        )
      })}
    </div>
  )
}
