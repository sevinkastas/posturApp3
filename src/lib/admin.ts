import {
  ADMIN_EMAIL,
  ADMIN_NAME,
  ADMIN_PASSWORD,
  type PlanId,
  type SessionUser,
} from '@/lib/session'

/**
 * Sistem yöneticisi katmanı.
 * Admin KAYIT OLAMAZ — yalnızca session.ts içinde tanımlı sabit
 * yönetici hesabıyla giriş yapabilir; bu hesap silinemez.
 */
export const ADMIN_EMAIL_RESERVED_MESSAGE =
  'Bu e-posta sistem yöneticisi için ayrılmıştır. Admin hesabı kayıt ile oluşturulamaz.'

export function isAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === ADMIN_EMAIL
}

export function isAdminCredentials(email: string, password: string): boolean {
  return isAdminEmail(email) && password === ADMIN_PASSWORD
}

/** Sabit yönetici oturumu oluşturur */
export function createAdminSession(): SessionUser {
  return {
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    role: 'admin',
    plan: 'admin' satisfies PlanId,
  }
}
