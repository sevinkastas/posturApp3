'use client'

import { ShieldCheck, Clock } from 'lucide-react'
import Link from 'next/link'

export default function PhysioPendingPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-chart-4/10 text-chart-4">
          <Clock className="size-7" aria-hidden />
        </div>
        <h1 className="mt-5 text-lg font-semibold">Fizyoterapist onayı bekliyorum</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Hesabınız sistem yöneticisinin onayı için beklemede.
          <br />
          Onay sonrası klinik panelinize erişim açılacaktır.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-muted px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Tekrar giriş yap
          </Link>
          <p className="text-[11px] text-muted-foreground">
            Yöneticiye ulaşılamıyorsa destek talebi açın:{' '}
            <Link href="/support" className="text-primary underline">destek</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
