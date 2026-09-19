import type { Role } from '@/lib/roles'

/**
 * Oturum modeli — demo amaçlı client-side oturum.
 * Gerçek backend bağlandığında bu katman API çağrılarıyla değiştirilmelidir.
 */
export type PlanId = 'free' | 'patient-premium' | 'physio-premium' | 'admin'

export interface SessionUser {
  name: string
  email: string
  phone?: string
  role: Role
  plan: PlanId
  licenseNo?: string
  premiumSince?: string
}

/**
 * Sabit sistem yöneticisi hesabı — kayıt olamaz, yalnızca bu
 * kimlik bilgileriyle giriş yapar. Konfigürasyona bağlı sabit değerdir.
 */
export const ADMIN_EMAIL = 'admin@posturapp.com'
export const ADMIN_PASSWORD = 'admin1478'
export const ADMIN_NAME = 'Sistem Yöneticisi'

const SESSION_KEY = 'posturapp.session'
const TOKEN_COOKIE = 'posturapp_token'
const ROLE_COOKIE = 'posturapp_role'
const PLAN_COOKIE = 'posturapp_plan'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 gün

export function isAdminUser(user: SessionUser | null | undefined): boolean {
  if (!user) return false
  return user.role === 'admin' || user.email.toLowerCase() === ADMIN_EMAIL
}

/** Premium = ücretli danışan veya uzman paketi; yönetici hesabı premium sayılmaz */
export function isPremiumUser(user: SessionUser | null | undefined): boolean {
  if (!user || isAdminUser(user)) return false
  return user.plan === 'patient-premium' || user.plan === 'physio-premium'
}

export function planName(plan: PlanId): string {
  switch (plan) {
    case 'patient-premium':
      return 'Danışan Premium'
    case 'physio-premium':
      return 'Uzman Premium'
    case 'admin':
      return 'Yönetim Hesabı'
    default:
      return 'Ücretsiz Üyelik'
  }
}

/** E-postadan okunabilir bir görünen ad üretir (örn. "ahmet.yilmaz@..." → "Ahmet Yilmaz") */
export function displayNameFromEmail(email: string, _role?: Role): string {
  const local = email.split('@')[0] ?? ''
  const cleaned = local
    .replace(/[._-]+/g, ' ')
    .replace(/\d+/g, '')
    .trim()
  if (!cleaned) return 'Kullanıcı'
  return cleaned
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1))
    .join(' ')
}

export function createUser(input: {
  name: string
  email: string
  phone?: string
  role: Role
  plan: PlanId
  licenseNo?: string
}): SessionUser {
  const premium = input.plan === 'patient-premium' || input.plan === 'physio-premium'
  return {
    name: input.name,
    email: input.email,
    phone: input.phone,
    role: input.role,
    plan: input.plan,
    licenseNo: input.licenseNo,
    premiumSince: premium ? new Date().toISOString() : undefined,
  }
}

/** localStorage oturum kaydı */
export function readSession(): SessionUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}

/** localStorage + middleware'in okuduğu çerezleri yazar */
export function persistSession(user: SessionUser): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } catch {
    /* storage kapalı olabilir */
  }
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(user.email)}; path=/; max-age=${COOKIE_MAX_AGE}`
  document.cookie = `${ROLE_COOKIE}=${user.role}; path=/; max-age=${COOKIE_MAX_AGE}`
  document.cookie = `${PLAN_COOKIE}=${user.plan}; path=/; max-age=${COOKIE_MAX_AGE}`
}

export function clearSession(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* yoksay */
  }
  for (const name of [TOKEN_COOKIE, ROLE_COOKIE, PLAN_COOKIE]) {
    document.cookie = `${name}=; path=/; max-age=0`
  }
}
