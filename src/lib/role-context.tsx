'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { NAVIGATION, ROLES, type NavItem, type Role, type RoleMeta } from '@/lib/roles'
import {
  clearSession,
  createUser,
  displayNameFromEmail,
  isAdminUser,
  isPremiumUser,
  persistSession,
  readSession,
  type PlanId,
  type SessionUser,
} from '@/lib/session'
import {
  ADMIN_EMAIL_RESERVED_MESSAGE,
  createAdminSession,
  isAdminCredentials,
  isAdminEmail,
} from '@/lib/admin'
import { createRegistryEntry, findUserByEmail, readRegistry, upsertUser } from '@/lib/registry-store'

export interface SignInInput {
  email: string
  password: string
  role: Role
  /** Fizyoterapist girişi premium üyelik doğrulaması gerektirir */
  premium: boolean
}

export interface RegisterInput {
  name: string
  email: string
  phone: string
  password: string
  role: Role
  premium: boolean
  licenseNo?: string
}

export interface AuthResult {
  ok: boolean
  user?: SessionUser
  error?: string
  /** Fizyoterapist kaydı yönetici onayı bekliyor */
  pendingApproval?: boolean
}

interface SessionContextValue {
  /** localStorage okuması tamamlandı mı? */
  ready: boolean
  user: SessionUser | null
  role: Role
  isPremium: boolean
  /** Sabit sistem yöneticisi hesabı mı? */
  isAdmin: boolean
  /** Uzman hesabının yönetici onay durumu (varsa) */
  approvalStatus: string | null
  meta: RoleMeta
  navigation: NavItem[]
  signIn: (input: SignInInput) => AuthResult
  register: (input: RegisterInput) => AuthResult
  signOut: () => void
  deleteAccount: () => void
  purchasePlan: (plan: PlanId) => AuthResult
}

const SessionContext = createContext<SessionContextValue | null>(null)

/** Kayıt defterine yazılabilen daraltılmış rol/plan tipleri */
type RegistryRole = 'patient' | 'physio'
type RegistryPlan = 'free' | 'patient-premium' | 'physio-premium'

/** Premium satın almamış bir fizyoterapist hesabı klinik panele erişemez */
function resolveRoleAndPlan(
  role: Role,
  premium: boolean,
): { role: RegistryRole; plan: RegistryPlan } {
  if (role === 'physio') {
    return premium ? { role: 'physio', plan: 'physio-premium' } : { role: 'patient', plan: 'free' }
  }
  return { role: 'patient', plan: premium ? 'patient-premium' : 'free' }
}

/** Oturum planını kayıt defteri planına daraltır (admin planı deftere yazılmaz) */
function toRegistryPlan(plan: PlanId): RegistryPlan {
  return plan === 'patient-premium' || plan === 'physio-premium' ? plan : 'free'
}

/** Oturum rolünü kayıt defteri rolüne daraltır (admin deftere yazılmaz) */
function toRegistryRole(role: Role): RegistryRole {
  return role === 'physio' ? 'physio' : 'patient'
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState<SessionUser | null>(null)

  // Oturum yalnızca tarayıcıda okunur; çerez kontrolünü middleware yapar
  useEffect(() => {
    setUser(readSession())
    setReady(true)
  }, [])

  const applyUser = useCallback((next: SessionUser | null) => {
    setUser(next)
    if (next) persistSession(next)
    else clearSession()
  }, [])

  const signIn = useCallback<SessionContextValue['signIn']>(
    ({ email, password, role, premium }) => {
      // 1) Sabit sistem yöneticisi hesabı — kayıt gerektirmez
      if (isAdminEmail(email)) {
        if (!isAdminCredentials(email, password)) {
          return { ok: false, error: 'Yönetici şifresi hatalı. Lütfen tekrar deneyin.' }
        }
        const admin = createAdminSession()
        applyUser(admin)
        return { ok: true, user: admin }
      }

      // 2) Kayıt defteri kaydı — onay durumu ve yönetici tarafından tanımlı rol/plan esas alınır
      const record = findUserByEmail(email)

      if (record) {
        if (record.status === 'pending') {
          return { ok: false, error: 'Uzman hesabınız yönetici onayı bekliyor. Onay sonrası giriş yapabilirsiniz.' }
        }
        if (record.status === 'rejected') {
          return {
            ok: false,
            error: 'Uzman başvurunuz reddedildi. Detay için destek ekibiyle iletişime geçebilirsiniz.',
          }
        }
        if (record.status === 'suspended') {
          return { ok: false, error: 'Hesabınız askıya alındı. Lütfen sistem yöneticisiyle iletişime geçin.' }
        }

        // Onaylı fizyoterapist: rolü kayıt defterinden gelir. Klinik panel erişimi,
        // uzman paketi (physio-premium) satın alınmışsa middleware tarafından açılır.
        if (record.role === 'physio') {
          const physio = createUser({
            name: record.name,
            email: record.email,
            phone: record.phone,
            role: 'physio',
            plan: toRegistryPlan(record.plan),
            licenseNo: record.licenseNo,
          })
          applyUser(physio)
          return { ok: true, user: physio }
        }

        // Danışan: rol ve plan kayıt defterinden gelir (satın alınan premium korunur)
        const patient = createUser({
          name: record.name,
          email: record.email,
          phone: record.phone,
          role: 'patient',
          plan: record.plan,
        })
        applyUser(patient)
        return { ok: true, user: patient }
      }

      // 3) Kayıt defterinde kaydı olmayan hesap yalnızca danışan olarak giriş yapabilir.
      //    Fizyoterapistlik kayıt + yönetici onayı + uzman paketi satın alma ile kazanılır.
      if (role === 'physio') {
        return {
          ok: false,
          error:
            'Fizyoterapist girişi için yönetici onaylı uzman hesabı ve satın alınmış uzman paketi gereklidir.',
        }
      }
      const resolved = resolveRoleAndPlan('patient', premium)
      const next = createUser({
        name: displayNameFromEmail(email, 'patient'),
        email,
        role: 'patient',
        plan: resolved.plan,
      })
      applyUser(next)
      return { ok: true, user: next }
    },
    [applyUser],
  )

  const register = useCallback<SessionContextValue['register']>(
    ({ name, email, phone, role, premium, licenseNo }) => {
      // Admin kimliğiyle hesap açılamaz
      if (isAdminEmail(email)) {
        return { ok: false, error: ADMIN_EMAIL_RESERVED_MESSAGE }
      }

      const resolved = resolveRoleAndPlan(role, premium)

      // Fizyoterapist kaydı: deftere "onay bekliyor" olarak yazılır, otomatik giriş yapılmaz
      if (resolved.role === 'physio') {
        const displayName = name.startsWith('Dr.') ? name : `Dr. ${name}`
        upsertUser(
          createRegistryEntry({
            name: displayName,
            email,
            phone,
            role: 'physio',
            plan: 'physio-premium',
            licenseNo,
          }),
        )
        return {
          ok: true,
          pendingApproval: true,
          user: createUser({ name: displayName, email, phone, role: 'physio', plan: 'physio-premium', licenseNo }),
        }
      }

      // Danışan kaydı: hesap doğrudan aktif, deftere işlenir
      const next = createUser({ name, email, phone, role: 'patient', plan: resolved.plan })
      upsertUser(
        createRegistryEntry({
          name,
          email,
          phone,
          role: 'patient',
          plan: resolved.plan,
        }),
      )
      applyUser(next)
      return { ok: true, user: next }
    },
    [applyUser],
  )

  const signOut = useCallback(() => {
    applyUser(null)
    window.location.href = '/login'
  }, [applyUser])

  const deleteAccount = useCallback(() => {
    // Sabit yönetici hesabı silinemez — yönetim merkezi her zaman aktiftir
    if (isAdminUser(user ?? readSession())) return
    applyUser(null)
    window.location.href = '/register'
  }, [applyUser, user])

  const purchasePlan = useCallback<SessionContextValue['purchasePlan']>(
    (plan) => {
      const current = user ?? readSession()

      // Yönetici hesabı plan satın almaz
      if (isAdminUser(current)) {
        return { ok: false, error: 'Yönetici hesabı premium satın alma işlemi yapamaz.' }
      }

      // Fizyoterapist paketi yalnızca yönetici onaylı uzman hesaplarına tanımlanır
      if (plan === 'physio-premium') {
        const record = current?.email ? findUserByEmail(current.email) : undefined
        if (!record || record.role !== 'physio' || record.status !== 'approved') {
          if (current?.email) {
            upsertUser(
              createRegistryEntry({
                name: current.name,
                email: current.email,
                phone: current.phone,
                role: 'physio',
                plan: 'physio-premium',
                licenseNo: current.licenseNo,
              }),
            )
          }
          return {
            ok: false,
            pendingApproval: true,
            error:
              'Fizyoterapist paketi yalnızca yönetici onaylı uzman hesaplarına tanımlanır. Başvurunuz onay kuyruğuna iletildi.',
          }
        }
      }

      const next = createUser({
        name: current?.name ?? 'Danışan',
        email: current?.email ?? 'danisan@posturapp.com',
        phone: current?.phone,
        role: plan === 'physio-premium' ? 'physio' : 'patient',
        plan,
        licenseNo: current?.licenseNo,
      })
      applyUser(next)
      if (next.email) {
        upsertUser({
          ...(findUserByEmail(next.email) ?? createRegistryEntry({
            name: next.name,
            email: next.email,
            phone: next.phone,
            role: toRegistryRole(next.role),
            plan: toRegistryPlan(next.plan),
          })),
          plan: toRegistryPlan(plan),
          status: 'approved',
          reviewedAt: new Date().toISOString(),
        })
      }
      return { ok: true, user: next }
    },
    [applyUser, user],
  )

  const value = useMemo<SessionContextValue>(() => {
    const role = user?.role ?? 'patient'
    const premium = isPremiumUser(user)
    const approvalStatus = user?.email ? (findUserByEmail(user.email)?.status ?? null) : null
    return {
      ready,
      user,
      role,
      isPremium: premium,
      isAdmin: isAdminUser(user),
      approvalStatus,
      meta: ROLES[role],
      navigation: NAVIGATION[role].filter((item) => !item.premiumOnly || premium),
      signIn,
      register,
      signOut,
      deleteAccount,
      purchasePlan,
    }
  }, [ready, user, signIn, register, signOut, deleteAccount, purchasePlan])

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useRole() {
  const ctx = useContext(SessionContext)
  if (!ctx) {
    throw new Error('useRole, <RoleProvider> içinde kullanılmalıdır')
  }
  return ctx
}

/** Oturum bilgilerine kısayol erişim */
export function useSession() {
  return useRole()
}
