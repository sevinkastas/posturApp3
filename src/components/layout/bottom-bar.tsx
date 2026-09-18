'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import { cn } from '@/lib/utils'

export function BottomBar() {
  const pathname = usePathname()
  const { navigation } = useRole()
  const items = navigation.filter((item) => item.primary).slice(0, 4)

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl lg:hidden"
      aria-label="Alt gezinme"
    >
      <div
        className="mx-auto grid max-w-md px-2 pb-[env(safe-area-inset-bottom)]"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl transition-colors',
                  active ? 'bg-primary/15' : 'bg-transparent',
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
