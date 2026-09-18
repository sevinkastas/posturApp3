'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { NAVIGATION, ROLES, type NavItem, type Role, type RoleMeta } from '@/lib/roles'

interface RoleContextValue {
  role: Role
  setRole: (role: Role) => void
  meta: RoleMeta
  navigation: NavItem[]
}

const RoleContext = createContext<RoleContextValue | null>(null)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('patient')

  const value = useMemo<RoleContextValue>(
    () => ({
      role,
      setRole,
      meta: ROLES[role],
      navigation: NAVIGATION[role],
    }),
    [role],
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) {
    throw new Error('useRole, <RoleProvider> içinde kullanılmalıdır')
  }
  return ctx
}
