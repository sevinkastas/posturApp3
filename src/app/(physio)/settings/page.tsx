'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogOut, Moon, Shield, Sun, Trash2, UserX } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { useRole } from '@/lib/role-context'
import { useTheme } from '@/lib/theme-context'
import { planName } from '@/lib/session'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user, isPremium, signOut, deleteAccount } = useRole()
  const { theme, setTheme } = useTheme()
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Ayarlar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tema, üyelik ve hesap işlemleri</p>
      </div>

      <Panel title="Görünüm" description="Uygulama temasını seçin — varsayılan aydınlık">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-1 items-center gap-3 rounded-xl border p-4 text-left transition-colors',
              theme === 'light' ? 'border-primary/50 bg-primary/10' : 'border-border hover:border-primary/40',
            )}
          >
            <Sun className={cn('size-5', theme === 'light' ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
            <div>
              <p className="text-sm font-medium">Aydınlık</p>
              <p className="text-xs text-muted-foreground">Varsayılan tema</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-1 items-center gap-3 rounded-xl border p-4 text-left transition-colors',
              theme === 'dark' ? 'border-primary/50 bg-primary/10' : 'border-border hover:border-primary/40',
            )}
          >
            <Moon className={cn('size-5', theme === 'dark' ? 'text-primary' : 'text-muted-foreground')} aria-hidden />
            <div>
              <p className="text-sm font-medium">Koyu Tema</p>
              <p className="text-xs text-muted-foreground">Gece kullanımı için</p>
            </div>
          </button>
        </div>
      </Panel>

      <Panel title="Üyelik" description="Mevcut paketiniz ve yükseltme seçenekleri">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-medium">{planName(user?.plan ?? 'free')}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          {!isPremium && (
            <Link
              href="/premium"
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Premium&apos;a Geç
            </Link>
          )}
        </div>
      </Panel>
      <Panel title="Hesap İşlemleri" description="Bu işlemler geri alınamaz">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <LogOut className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium">Çıkış Yap</p>
                <p className="text-xs text-muted-foreground">Oturumunuzu güvenle kapatın</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:border-destructive/40 hover:text-destructive"
            >
              Çıkış Yap
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <UserX className="size-5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-medium text-destructive">Hesabımı Sil</p>
                <p className="text-xs text-muted-foreground">
                  Tüm verileriniz silinir ve kayıt ekranına yönlendirilirsiniz
                </p>
              </div>
            </div>
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={deleteAccount}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Evet, Sil
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground"
                >
                  Vazgeç
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="rounded-xl border border-destructive/40 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
              >
                Hesabımı Sil
              </button>
            )}
          </div>
        </div>
      </Panel>
    </div>
  )
}
