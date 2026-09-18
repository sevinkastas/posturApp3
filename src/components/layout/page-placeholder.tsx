import type { LucideIcon } from 'lucide-react'

interface PagePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
}

export function PagePlaceholder({ title, description, icon: Icon }: PagePlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary neon-glow">
          <Icon className="size-7" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-medium">Bu modül yakında burada</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          İskelet hazır. Bu alana içerik, tablo ve grafik bileşenlerini ekleyerek modülü
          genişletebilirsiniz.
        </p>
      </div>
    </div>
  )
}
