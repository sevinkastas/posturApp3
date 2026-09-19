import { readRegistry } from '@/lib/registry-store'
import { readTickets } from '@/lib/support-tickets'

/**
 * Sistem geneli analitik ve sağlık (demo — kısmen gerçek veriden türetilir).
 * Aktif kullanıcı sayısı kayıt defterinden, talep istatistikleri biletlerden gelir;
 * tarama hacmi ve performans metrikleri demo seridir.
 */

export interface DailyScanPoint {
  label: string
  scans: number
}

export interface PlatformAnalytics {
  totalUsers: number
  activeUsers: number
  physioCount: number
  pendingApprovals: number
  premiumCount: number
  scansToday: number
  scansSeries: DailyScanPoint[]
  avgScore: number
  systemHealth: {
    uptime: string
    apiLatencyMs: number
    errorRate: string
    dbLatencyMs: number
  }
  ticketStats: {
    open: number
    inProgress: number
    resolved: number
  }
}

const SCAN_SERIES: DailyScanPoint[] = [
  { label: 'Pzt', scans: 182 },
  { label: 'Sal', scans: 214 },
  { label: 'Çar', scans: 198 },
  { label: 'Per', scans: 241 },
  { label: 'Cum', scans: 289 },
  { label: 'Cmt', scans: 312 },
  { label: 'Paz', scans: 267 },
]

export function getPlatformAnalytics(): PlatformAnalytics {
  const registry = readRegistry()
  const tickets = readTickets()

  return {
    totalUsers: registry.length,
    activeUsers: registry.filter((u) => u.status !== 'suspended').length,
    physioCount: registry.filter((u) => u.role === 'physio').length,
    pendingApprovals: registry.filter((u) => u.status === 'pending').length,
    premiumCount: registry.filter((u) => u.plan !== 'free').length,
    scansToday: SCAN_SERIES[SCAN_SERIES.length - 1].scans,
    scansSeries: SCAN_SERIES,
    avgScore: 74,
    systemHealth: {
      uptime: '%99.96',
      apiLatencyMs: 142,
      errorRate: '%0.4',
      dbLatencyMs: 38,
    },
    ticketStats: {
      open: tickets.filter((t) => t.status === 'open').length,
      inProgress: tickets.filter((t) => t.status === 'in-progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
    },
  }
}
