'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, HeartPulse, Info, Lock, Mail, Stethoscope } from 'lucide-react'
import { useRole, type SignInInput } from '@/lib/role-context'
import type { Role } from '@/lib/roles'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@/lib/session'
import { sanitizeEmail, validateEmail, validatePassword } from '@/lib/validation'
import { cn } from '@/lib/utils'

const INPUT =
  'w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary'

export default function LoginPage() {
  const { signIn } = useRole()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<SignInInput['role']>('patient')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const emailError = validateEmail(email)
    if (emailError) return setError(emailError)
    const passwordError = validatePassword(password)
    if (passwordError) return setError(passwordError)

    setError('')
    setLoading(true)
    try {
      const result = signIn({ email: sanitizeEmail(email), password, role, premium: false })
      if (!result.ok) {
        setError(result.error ?? 'Giriş yapılamadı.')
        return
      }
      // yönetici hesabı panel yerine yönetici alanına yönlenir
      window.location.href = result.user?.role === 'admin' ? '/admin' : '/'
    } finally {
      setLoading(false)
    }
  }

  const options: { id: Role; label: string; desc: string; icon: typeof HeartPulse }[] = [
    { id: 'patient', label: 'Danışan', desc: 'Kişisel postür takibi', icon: HeartPulse },
    { id: 'physio', label: 'Uzman', desc: 'Onaylı uzman · Premium paket', icon: Stethoscope },
  ]

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary neon-glow">
            <Activity className="size-6" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Tekrar Hoş Geldiniz</h1>
          <p className="mt-1 text-sm text-muted-foreground">Postür ve egzersiz takibiniz için giriş yapın</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {options.map((o) => {
              const Icon = o.icon
              const active = role === o.id
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setRole(o.id)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors',
                    active
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  <span className="text-sm font-medium">{o.label}</span>
                  <span className="text-[10px] leading-tight">{o.desc}</span>
                </button>
              )
            })}
          </div>

          {role === 'physio' && (
            <p className="rounded-xl border border-border bg-muted/30 p-3 text-xs leading-snug text-muted-foreground">
              Fizyoterapist paneli yalnızca <span className="font-medium text-foreground">yönetici onaylı</span> ve{' '}
              <span className="font-medium text-foreground">uzman paketini satın almış</span> hesaplara açılır.
              Uzman başvurusu için kayıt ekranını kullanın.
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-posta Adresi</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" className={INPUT} />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Şifre</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={INPUT} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            {!loading && <ArrowRight className="size-4" aria-hidden />}
          </button>

          <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <p>
              Yönetici girişi: <span className="font-medium text-foreground">{ADMIN_EMAIL}</span> /{' '}
              <span className="font-medium text-foreground">{ADMIN_PASSWORD}</span> — admin kayıt olamaz,
              yalnızca sabit hesapla giriş yapar.
            </p>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Hesabınız yok mu?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Kayıt Olun
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
