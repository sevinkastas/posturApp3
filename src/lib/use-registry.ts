'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RegistryUser } from '@/lib/registry-types'
import { readRegistry, setUserStatus, writeRegistry } from '@/lib/registry-store'

/** Yönetici onay kuyruğuna reaktif erişim */
export function useRegistry() {
  const [users, setUsers] = useState<RegistryUser[]>([])

  useEffect(() => {
    setUsers(readRegistry())
  }, [])

  const refresh = useCallback(() => setUsers(readRegistry()), [])

  const approve = useCallback((id: string, note?: string) => {
    setUserStatus(id, 'approved', note)
    setUsers(readRegistry())
  }, [])

  const reject = useCallback((id: string, note?: string) => {
    setUserStatus(id, 'rejected', note)
    setUsers(readRegistry())
  }, [])

  const suspend = useCallback((id: string, note?: string) => {
    setUserStatus(id, 'suspended', note)
    setUsers(readRegistry())
  }, [])

  const setRolePlan = useCallback(
    (id: string, plan: RegistryUser['plan']) => {
      writeRegistry(readRegistry().map((u) => (u.id === id ? { ...u, plan } : u)))
      setUsers(readRegistry())
    },
    [],
  )

  const pendingCount = users.filter((u) => u.status === 'pending').length

  return { users, pendingCount, refresh, approve, reject, suspend, setRolePlan }
}
