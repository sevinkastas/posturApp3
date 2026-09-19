'use client'

import { useCallback, useEffect, useState } from 'react'
import type { SupportTicket, TicketStatus } from '@/lib/support-tickets'
import {
  addTicketReply,
  readTickets,
  updateTicketStatus,
} from '@/lib/support-tickets'

/** Destek taleplerine reaktif erişim (danışan, uzman ve admin panelleri) */
export function useSupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])

  useEffect(() => {
    setTickets(readTickets())
  }, [])

  const refresh = useCallback(() => setTickets(readTickets()), [])

  const setStatus = useCallback((id: string, status: TicketStatus) => {
    updateTicketStatus(id, status)
    setTickets(readTickets())
  }, [])

  const reply = useCallback(
    (
      id: string,
      author: string,
      role: 'user' | 'physio' | 'admin',
      message: string,
    ) => {
      addTicketReply(id, { author, role, message })
      setTickets(readTickets())
    },
    [],
  )

  return { tickets, refresh, setStatus, reply }
}
