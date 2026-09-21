'use client'

import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Activity, ArrowRight } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import { GuideProvider } from '@/lib/guide-context'
import { Sidebar } from './sidebar'
import { Navbar } from './navbar'
import { BottomBar } from './bottom-bar'
import { GuideDrawer } from '@/components/guide/guide-drawer'

export function AppShell({ children }: { children: ReactNode }) {
  const { ready, user } = useRole()
  const router = useRouter()

  // Çerez var ama oturum kaydı yoksa (örn. tarayıcı verisi temizlenmişse) girişe dön
  useEffect(() => {
    if (ready && !user) {
      router.replace('/login')
    }
  }, [ready, user, router])

  return (
    <GuideProvider>
      {/* Oturum bilgisi localStorage'dan okunana kadar iskelet göster */}
      {!ready ? (
        <div className="flex min-h-dvh items-center justify-center bg-background">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Activity className="size-5 animate-pulse" aria-hidden />
            </span>
            Oturum doğrulanıyor...
          </div>
        </div>
      ) : !user ? (
        <div className="flex min-h-dvh items-center justify-center bg-background px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center">
            <h1 className="text-lg font-semibold">Giriş ekranına yönlendiriliyorsunuz</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Oturum bulunamadı. Devam etmek için giriş yapın veya hesap oluşturun.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Giriş Yap
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-dvh bg-background">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Navbar />
            <main className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
          </div>
          <BottomBar />
          {/* "Nasıl Kullanılır? / Tarama Rehberi" her zaman erişilebilir çekmece */}
          <GuideDrawer />
        </div>
      )}
    </GuideProvider>
  )
}
