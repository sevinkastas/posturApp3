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
  MessageSquarePlus,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  LifeBuoy,
} from 'lucide-react'

/** Sistem rolleri — admin kayıt olamaz, yalnızca sabit yönetici hesabıyla giriş yapar */
export type Role = 'patient' | 'physio' | 'admin'

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
  /** Only premium (ücretli) hesaplara gösterilir */
  premiumOnly?: boolean
  /** Fizyoterapist panelini tanıtan alt açıklama */
  hint?: string
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
  admin: {
    id: 'admin',
    label: 'Sistem Yöneticisi',
    shortLabel: 'Yönetici',
    description: 'Teknik ve içerik altyapısının idari merkezi',
    icon: ShieldCheck,
  },
}

/**
 * Danışan menüsü — premium alanlar (canlı destek / premium üyelik)
 * yalnızca premium hesap sahiplerine gösterilir.
 */
export const PATIENT_NAVIGATION: NavItem[] = [
  { label: 'Panel', href: '/', icon: LayoutDashboard, primary: true },
  { label: 'Tarama', href: '/scan', icon: ScanLine, primary: true },
  { label: 'Analizlerim', href: '/analyses', icon: Activity, primary: true },
  { label: 'Egzersizler', href: '/exercises', icon: Dumbbell, primary: true },
  {
    label: 'Canlı Destek',
    href: '/support',
    icon: MessageSquarePlus,
    premiumOnly: true,
    hint: 'Premium ile uzman desteği',
  },
  { label: 'Premium', href: '/premium', icon: Shield, hint: 'Fizyoterapist desteği satın al' },
  { label: 'Profil', href: '/profile', icon: User },
]

/**
 * Fizyoterapist (uzman) menüsü — sadece premium uzman paketine
 * sahip kullanıcılar bu paneli görür.
 */
export const PHYSIO_NAVIGATION: NavItem[] = [
  { label: 'Panel', href: '/', icon: LayoutDashboard, primary: true },
  {
    label: 'Danışanlar',
    href: '/clients',
    icon: Users,
    primary: true,
    premiumOnly: true,
    hint: 'Danışan portföyü ve ilerleme izleme',
  },
  {
    label: 'AI Onayı',
    href: '/reviews',
    icon: ShieldAlert,
    primary: true,
    premiumOnly: true,
    hint: 'Yapay zeka ölçüm ve program onayı',
  },
  {
    label: 'Klinik Notlar',
    href: '/notes',
    icon: ClipboardList,
    primary: true,
    premiumOnly: true,
    hint: 'Değerlendirme ve not ekleme',
  },
  {
    label: 'Canlı Destek',
    href: '/support',
    icon: MessageSquarePlus,
    premiumOnly: true,
    hint: 'Gelen destek talepleri ve kazanç',
  },
  { label: 'Randevular', href: '/appointments', icon: CalendarDays, premiumOnly: true },
  { label: 'Raporlar', href: '/reports', icon: FileText, premiumOnly: true },
  {
    label: 'Premium',
    href: '/premium',
    icon: Shield,
    primary: true,
    hint: 'Uzman paketini satın alarak klinik paneli aç',
  },
]

/**
 * Sistem yöneticisi (admin) menüsü.
 * Admin kayıt olamaz; yalnızca sabit yönetici hesabı bu panele erişir.
 */
export const ADMIN_NAVIGATION: NavItem[] = [
  { label: 'Genel Bakış', href: '/admin', icon: LayoutDashboard, primary: true },
  {
    label: 'Egzersiz Havuzu',
    href: '/admin/exercises',
    icon: Dumbbell,
    primary: true,
    hint: 'Ortak egzersiz havuzunu yönet',
  },
  {
    label: 'Kullanıcı Onayı',
    href: '/admin/users',
    icon: Users,
    primary: true,
    hint: 'Fizyoterapist onayı ve rol yetkilendirmesi',
  },
  {
    label: 'Analitik',
    href: '/admin/analytics',
    icon: Activity,
    primary: true,
    hint: 'Kullanım hacmi ve sistem sağlığı',
  },
  {
    label: 'Destek Talepleri',
    href: '/admin/support',
    icon: LifeBuoy,
    hint: 'Teknik aksaklık ve geri bildirim yönetimi',
  },
  { label: 'Ayarlar', href: '/settings', icon: Settings },
]

export const NAVIGATION: Record<Role, NavItem[]> = {
  patient: PATIENT_NAVIGATION,
  physio: PHYSIO_NAVIGATION,
  admin: ADMIN_NAVIGATION,
}

/** Premium paketler — fizyoterapist paneli ücretli üyelik gerektirir */
export interface PremiumPlan {
  id: 'patient-premium' | 'physio-premium'
  name: string
  price: string
  period: string
  targetRole: Role
  description: string
  features: string[]
}

export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'patient-premium',
    name: 'Danışan Premium',
    price: '₺149',
    period: '/ ay',
    targetRole: 'patient',
    description: 'AI analizlerinin uzman onayı ve canlı destek görüşmeleri.',
    features: [
      'Fizyoterapist onaylı analiz raporları',
      'Ayda 2 canlı görüntülü destek görüşmesi',
      'Öncelikli inceleme kuyruğu',
      'Kişiye özel revize edilmiş egzersiz programı',
    ],
  },
  {
    id: 'physio-premium',
    name: 'Fizyoterapist Premium',
    price: '₺499',
    period: '/ ay',
    targetRole: 'physio',
    description: 'Klinik panelin tamamı ve canlı destek vererek gelir elde etme.',
    features: [
      'Danışan portföyü ve ilerleme izleme paneli',
      'Yapay zeka analizlerini denetleme ve onaylama',
      'Klinik değerlendirme ve not ekleme alanı',
      'Canlı destek taleplerini ücretlendirip yanıtlama',
      'Komisyonsuz kazanç modeli',
    ],
  },
]

export const PREMIUM_PLAN_BY_ID: Record<string, PremiumPlan> = PREMIUM_PLANS.reduce(
  (acc, plan) => ({ ...acc, [plan.id]: plan }),
  {},
)
