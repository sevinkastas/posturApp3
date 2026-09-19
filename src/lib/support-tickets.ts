/**
 * Destek talepleri (demo — localStorage).
 * Danışanlar talep açar, fizyoterapistler ücretli canlı destek verir,
 * admin teknik aksaklık ve geri bildirimleri yönetir.
 */

export type TicketCategory = 'teknik' | 'geri-bildirim' | 'görüşme' | 'faturalama'
export type TicketStatus = 'open' | 'in-progress' | 'resolved'
export type TicketPriority = 'low' | 'normal' | 'high'

export interface TicketReply {
  author: string
  role: 'user' | 'physio' | 'admin'
  message: string
  at: string
}

export interface SupportTicket {
  id: string
  userName: string
  userEmail: string
  subject: string
  message: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  /** Ücretli görüşme talebi ise görüşme ücreti (₺) */
  sessionFee?: number
  createdAt: string
  replies: TicketReply[]
}

const TICKETS_KEY = 'posturapp.tickets'

const SEED: SupportTicket[] = [
  {
    id: 'tk-1',
    userName: 'Ahmet Yılmaz',
    userEmail: 'ahmet@ornek.com',
    subject: 'Tarama sırasında kamera donuyor',
    message:
      'Sağ yan pozisyonda kamera görüntüsü 2-3 saniye donuyor, tarama yarım kalıyor.',
    category: 'teknik',
    status: 'open',
    priority: 'high',
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    replies: [],
  },
  {
    id: 'tk-2',
    userName: 'Zeynep Kaya',
    userEmail: 'zeynep@ornek.com',
    subject: 'Egzersiz video oynatıcı önerisi',
    message: 'Videolara yavaşlatılmış oynatma eklenirse çok faydalı olur.',
    category: 'geri-bildirim',
    status: 'in-progress',
    priority: 'normal',
    createdAt: new Date(Date.now() - 26 * 3600000).toISOString(),
    replies: [
      {
        author: 'Sistem Yöneticisi',
        role: 'admin',
        message: 'Öneriniz ürün ekibine iletildi, bir sonraki sürümde değerlendirilecek.',
        at: new Date(Date.now() - 20 * 3600000).toISOString(),
      },
    ],
  },
  {
    id: 'tk-3',
    userName: 'Mert Demir',
    userEmail: 'mert@ornek.com',
    subject: 'Canlı görüşme talebi — bel ağrısı',
    message: 'Bel bölgesindeki analiz sonucunu bir uzmanla görüşmek istiyorum.',
    category: 'görüşme',
    status: 'open',
    priority: 'normal',
    sessionFee: 250,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    replies: [],
  },
]

export function readTickets(): SupportTicket[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(TICKETS_KEY)
    if (!raw) {
      window.localStorage.setItem(TICKETS_KEY, JSON.stringify(SEED))
      return [...SEED]
    }
    return JSON.parse(raw) as SupportTicket[]
  } catch {
    return []
  }
}

export function writeTickets(tickets: SupportTicket[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets))
  } catch {
    /* yoksay */
  }
}

export function createTicket(input: {
  userName: string
  userEmail: string
  subject: string
  message: string
  category: TicketCategory
  sessionFee?: number
}): SupportTicket {
  const ticket: SupportTicket = {
    id: `tk-${Date.now()}`,
    userName: input.userName,
    userEmail: input.userEmail,
    subject: input.subject,
    message: input.message,
    category: input.category,
    status: 'open',
    priority: input.category === 'teknik' ? 'high' : 'normal',
    sessionFee: input.sessionFee,
    createdAt: new Date().toISOString(),
    replies: [],
  }
  writeTickets([ticket, ...readTickets()])
  return ticket
}

export function updateTicketStatus(id: string, status: TicketStatus): void {
  writeTickets(readTickets().map((t) => (t.id === id ? { ...t, status } : t)))
}

export function addTicketReply(
  id: string,
  reply: Omit<TicketReply, 'at'>,
  status: TicketStatus = 'in-progress',
): void {
  writeTickets(
    readTickets().map((t) =>
      t.id === id
        ? { ...t, status, replies: [...t.replies, { ...reply, at: new Date().toISOString() }] }
        : t,
    ),
  )
}
