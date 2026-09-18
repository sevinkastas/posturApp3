import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  ScanLine,
  Activity,
  Dumbbell,
  User,
  Users,
  CalendarDays,
  ClipboardList,
  FileText,
  Stethoscope,
  HeartPulse,
} from 'lucide-react'

export type Role = 'patient' | 'physio'

export interface RoleMeta {
  id: Role
  label: string
  shortLabel: string
  description: string
  icon: LucideIcon
}

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  /** Show this item in the mobile bottom bar */
  primary?: boolean
}

export const ROLES: Record<Role, RoleMeta> = {
  patient: {
    id: 'patient',
    label: 'Danışan / Hasta',
    shortLabel: 'Danışan',
    description: 'Kişisel postür takibi ve egzersiz programı',
    icon: HeartPulse,
  },
  physio: {
    id: 'physio',
    label: 'Fizyoterapist',
    shortLabel: 'Uzman',
    description: 'Danışan yönetimi ve klinik analiz paneli',
    icon: Stethoscope,
  },
}

export const NAVIGATION: Record<Role, NavItem[]> = {
  patient: [
    { label: 'Panel', href: '/', icon: LayoutDashboard, primary: true },
    { label: 'Tarama', href: '/scan', icon: ScanLine, primary: true },
    { label: 'Analizlerim', href: '/analyses', icon: Activity, primary: true },
    { label: 'Egzersizler', href: '/exercises', icon: Dumbbell, primary: true },
    { label: 'Profil', href: '/profile', icon: User },
  ],
  physio: [
    { label: 'Panel', href: '/', icon: LayoutDashboard, primary: true },
    { label: 'Danışanlar', href: '/clients', icon: Users, primary: true },
    { label: 'Randevular', href: '/appointments', icon: CalendarDays, primary: true },
    { label: 'İncelemeler', href: '/reviews', icon: ClipboardList, primary: true },
    { label: 'Raporlar', href: '/reports', icon: FileText },
  ],
}
