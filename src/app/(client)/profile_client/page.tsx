'use client'

import { useEffect, useState } from 'react'
import { Check, Pencil, Ruler, Weight } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { useRole } from '@/lib/role-context'
import { planName } from '@/lib/session'
import {
  formatPhone,
  sanitizeDigits,
  sanitizeEmail,
  sanitizeLocation,
  sanitizeName,
  validatePersonalInfo,
} from '@/lib/validation'

const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep']

export default function ProfilePage() {
  const { user, isPremium } = useRole()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    height: '',
    weight: '',
    age: '',
  })

  useEffect(() => {
    if (!user) return
    try {
      const stored = JSON.parse(window.localStorage.getItem('posturapp.profile') ?? '{}')
      setForm({
        name: user.name,
        email: user.email,
        phone: user.phone ?? '',
        location: stored.location ?? '',
        height: stored.height ?? '',
        weight: stored.weight ?? '',
        age: stored.age ?? '',
      })
    } catch {
      /* yoksay */
    }
  }, [user])

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const save = () => {
    const nextErrors = validatePersonalInfo(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    try {
      window.localStorage.setItem(
        'posturapp.profile',
        JSON.stringify({
          location: form.location,
          height: form.height,
          weight: form.weight,
          age: form.age,
        }),
      )
    } catch {
      /* yoksay */
    }
    setEditing(false)
    setSaved(true)
  }

  const inputClass = (key: string) =>
    `w-full rounded-xl border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary ${
      errors[key] ? 'border-destructive' : 'border-border'
    }`

  const field = (
    key: keyof typeof form,
    label: string,
    sanitize: (v: string) => string,
    placeholder?: string,
    extra?: React.ReactNode,
    listId?: string,
  ) => (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          value={form[key]}
          onChange={(e) => set(key, sanitize(e.target.value))}
          disabled={!editing}
          placeholder={placeholder}
          list={listId}
          className={inputClass(key)}
        />
        {extra}
      </div>
      {errors[key] && <p className="mt-1 text-xs text-destructive">{errors[key]}</p>}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Profilim</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kişisel bilgileriniz · Üyelik: {planName(user?.plan ?? 'free')}
            {isPremium ? ' (Premium)' : ''}
          </p>
        </div>
        {editing ? (
          <button
            type="button"
            onClick={save}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-4" aria-hidden />
            Değişiklikleri Kaydet
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              setErrors({})
              setEditing(true)
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Pencil className="size-4" aria-hidden />
            Düzenle
          </button>
        )}
      </div>

      {saved && !editing && (
        <div className="rounded-xl border border-chart-3/30 bg-chart-3/10 p-3 text-sm text-chart-3">
          Profil bilgileri kaydedildi.
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          Lütfen aşağıdaki alanları düzeltin.
        </div>
      )}

      <Panel title="Kişisel Bilgiler" description="Bu bilgiler analiz doğruluğu için kullanılır">
        <div className="grid gap-4 sm:grid-cols-2">
          {field('name', 'Ad Soyad', sanitizeName, 'Ahmet Yılmaz')}
          {field('email', 'E-posta', sanitizeEmail, 'ornek@mail.com')}
          {field('phone', 'Telefon', (v) => formatPhone(sanitizeDigits(v)), '0555 123 45 67')}
          {field('location', 'Konum', sanitizeLocation, 'İstanbul', undefined, 'cities-list')}

          {field('height', 'Boy (cm)', (v) => sanitizeDigits(v).slice(0, 3), '175', (
            <Ruler className="pointer-events-none absolute right-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
          ))}
          {field('weight', 'Kilo (kg)', (v) => sanitizeDigits(v).slice(0, 3), '72', (
            <Weight className="pointer-events-none absolute right-3.5 top-3 size-4 text-muted-foreground" aria-hidden />
          ))}
          {field('age', 'Yaş', (v) => sanitizeDigits(v).slice(0, 3), '32')}
        </div>
        <datalist id="cities-list">
          {CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        {editing && (
          <p className="mt-3 text-xs text-muted-foreground">
            İpucu: Konum alanında il önerileri için yazmaya başlayın.
          </p>
        )}
      </Panel>
    </div>
  )
}
