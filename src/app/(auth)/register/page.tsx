'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, CalendarCheck, HeartPulse, Lock, Mail, Phone, Stethoscope, User } from 'lucide-react'
import { useRole } from '@/lib/role-context'
import type { Role } from '@/lib/roles'
import {
  formatPhone,
  sanitizeEmail,
  sanitizeLicense,
  sanitizeName,
  validateEmail,
  validateLicenseNo,
  validateName,
  validatePassword,
  validatePhone,
} from '@/lib/validation'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const { register } = useRole()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('patient')
  const [licenseNo, setLicenseNo] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pendingApproval, setPendingApproval] = useState(false)
  const [loading, setLoading] = useState(false)

  const isPhysio = role === 'physio'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors: Record<string, string> = {}
    const nameError = validateName(name)
    if (nameError) nextErrors.name = nameError
    const emailError = validateEmail(email)
    if (emailError) nextErrors.email = emailError
    const phoneError = validatePhone(phone)
    if (phoneError) nextErrors.phone = phoneError
    const passwordError = validatePassword(password)
    if (passwordError) nextErrors.password = passwordError
    if (isPhysio) {
      const licenseError = validateLicenseNo(licenseNo)
      if (licenseError) nextErrors.licenseNo = licenseError
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      const result = register({
        name: sanitizeName(name).trim(),
        email: sanitizeEmail(email),
        phone: formatPhone(phone),
        password,
        role,
        premium: isPhysio,
        licenseNo: isPhysio ? licenseNo : undefined,
      })
      if (!result.ok) {
        setErrors({ form: result.error ?? 'Kayıt oluşturulamadı.' })
        return
      }
      if (result.pendingApproval) setPendingApproval(true)
      else window.location.href = '/'
    } finally {
      setLoading(false)
    }
  }
  if (pendingApproval) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-xl">
          <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary neon-glow">
            <CalendarCheck className="size-7" aria-hidden />
          </span>
          <h1 className="text-xl font-semibold">Başvurunuz alındı</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Uzman hesabınız yönetici onayı bekliyor. Onaylandıktan sonra aynı e-posta ve şifreyle
            giriş yapabilirsiniz.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Giriş ekranına dön
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    )
  }
  const fieldError = (key: string) =>
    errors[key] ? <p className="mt-1 text-xs text-destructive">{errors[key]}</p> : null

  const inputClass = (key: string) =>
    cn(
      'w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary',
      errors[key] ? 'border-destructive' : 'border-border',
    )

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-xl">
        <div className="mb-6 text-center">
          <span className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary neon-glow">
            <Activity className="size-6" aria-hidden />
          </span>
          <h1 className="text-2xl font-bold tracking-tight">Hesap Oluştur</h1>
          <p className="mt-1 text-sm text-muted-foreground">Postür analizi platformuna hemen katılın</p>
        </div>

        {errors.form && (
          <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-center text-sm text-destructive">
            {errors.form}
          </div>
        )}

        <form onSubmit={submit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors',
                !isPhysio ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-muted/30 text-muted-foreground',
              )}
            >
              <HeartPulse className="size-5" aria-hidden />
              <span className="text-sm font-medium">Danışan</span>
              <span className="text-[10px]">Ücretsiz</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('physio')}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors',
                isPhysio ? 'border-primary/50 bg-primary/10 text-primary' : 'border-border bg-muted/30 text-muted-foreground',
              )}
            >
              <Stethoscope className="size-5" aria-hidden />
              <span className="text-sm font-medium">Uzman</span>
              <span className="text-[10px]">₺499/ay · Onaylı</span>
            </button>
          </div>

          {isPhysio && (
            <p className="rounded-xl border border-border bg-muted/30 p-3 text-xs leading-snug text-muted-foreground">
              Uzman başvuruları yönetici onayından sonra aktifleşir. Klinik panel yalnızca premium
              uzman paketiyle açılır.
            </p>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Ad Soyad</label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
              <input type="text" value={name} onChange={(e) => setName(sanitizeName(e.target.value))} placeholder="Ahmet Yılmaz" className={inputClass('name')} />
            </div>
            {fieldError('name')}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">E-posta</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
              <input type="email" value={email} onChange={(e) => setEmail(sanitizeEmail(e.target.value))} placeholder="ornek@mail.com" className={inputClass('email')} />
            </div>
            {fieldError('email')}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Telefon</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
              <input type="tel" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="0555 123 45 67" className={inputClass('phone')} />
            </div>
            {fieldError('phone')}
          </div>

          {isPhysio && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Lisans Numarası</label>
              <div className="relative">
                <Activity className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
                <input type="text" value={licenseNo} onChange={(e) => setLicenseNo(sanitizeLicense(e.target.value))} placeholder="FZ-0000" className={inputClass('licenseNo')} />
              </div>
              {fieldError('licenseNo')}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Şifre</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value.replace(/\s/g, ''))} placeholder="En az 6 karakter, harf + rakam" className={inputClass('password')} />
            </div>
            {fieldError('password')}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Hesap oluşturuluyor...' : isPhysio ? 'Uzman Başvurusu Gönder' : 'Kayıt Ol'}
            {!loading && <ArrowRight className="size-4" aria-hidden />}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted-foreground">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  )
}
