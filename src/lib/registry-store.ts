import type { RegistryUser } from '@/lib/registry-types'

/**
 * Kullanıcı kayıt defteri (demo — localStorage).
 * Uzman başvuruları buraya "pending" olarak düşer; yönetici onaylar.
 */

const REGISTRY_KEY = 'posturapp.registry'

/** Demo başvurular — onay kuyruğunun boş görünmemesi için */
const SEED: RegistryUser[] = [
  {
    id: 'reg-seed-1',
    name: 'Dr. Ayşe Demir',
    email: 'ayse.demir@klinik.com',
    phone: '0532 111 22 33',
    role: 'physio',
    plan: 'physio-premium',
    status: 'pending',
    licenseNo: 'FZ-2201',
    requestedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'reg-seed-2',
    name: 'Dr. Can Öztürk',
    email: 'can.ozturk@klinik.com',
    phone: '0533 444 55 66',
    role: 'physio',
    plan: 'physio-premium',
    status: 'pending',
    licenseNo: 'FZ-3147',
    requestedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'reg-seed-3',
    name: 'Dr. Selin Arslan',
    email: 'selin.arslan@klinik.com',
    phone: '0534 777 88 99',
    role: 'physio',
    plan: 'physio-premium',
    status: 'approved',
    licenseNo: 'FZ-1024',
    requestedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    reviewedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    reviewNote: 'Lisans doğrulandı, panel erişimi açıldı.',
  },
]

export function readRegistry(): RegistryUser[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(REGISTRY_KEY)
    if (!raw) {
      window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(SEED))
      return [...SEED]
    }
    return JSON.parse(raw) as RegistryUser[]
  } catch {
    return []
  }
}

export function writeRegistry(users: RegistryUser[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(REGISTRY_KEY, JSON.stringify(users))
  } catch {
    /* yoksay */
  }
}

export function findUserByEmail(email: string): RegistryUser | undefined {
  const target = email.trim().toLowerCase()
  return readRegistry().find((u) => u.email.toLowerCase() === target)
}

export function createRegistryEntry(input: {
  name: string
  email: string
  phone?: string
  role: 'patient' | 'physio'
  plan: 'free' | 'patient-premium' | 'physio-premium'
  licenseNo?: string
}): RegistryUser {
  return {
    id: `reg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name,
    email: input.email,
    phone: input.phone ?? '',
    role: input.role,
    plan: input.plan,
    status: input.role === 'physio' ? 'pending' : 'approved',
    licenseNo: input.licenseNo,
    requestedAt: new Date().toISOString(),
  }
}

export function upsertUser(user: RegistryUser): void {
  const users = readRegistry()
  const index = users.findIndex((u) => u.email.toLowerCase() === user.email.toLowerCase())
  if (index >= 0) users[index] = { ...users[index], ...user }
  else users.push(user)
  writeRegistry(users)
}

export function setUserStatus(
  id: string,
  status: RegistryUser['status'],
  note?: string,
): void {
  const users = readRegistry().map((u) =>
    u.id === id ? { ...u, status, reviewNote: note, reviewedAt: new Date().toISOString() } : u,
  )
  writeRegistry(users)
}

export function removeUser(id: string): void {
  writeRegistry(readRegistry().filter((u) => u.id !== id))
}
