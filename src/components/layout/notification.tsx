'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, Check, Trash2, Activity, Dumbbell, ShieldAlert, X } from 'lucide-react'

// Örnek demo bildirimler
const initialNotifications = [
  {
    id: 1,
    title: 'Yeni Postür Analizi Hazır',
    description: '14 Mayıs tarihli tarama sonucunuz raporlandı.',
    time: '10 dk önce',
    read: false,
    type: 'analysis',
    icon: Activity,
  },
  {
    id: 2,
    title: 'Günlük Egzersiz Hatırlatıcısı',
    description: 'Bugünkü postür egzersizlerinizi tamamlamadınız.',
    time: '2 saat önce',
    read: false,
    type: 'exercise',
    icon: Dumbbell,
  },
  {
    id: 3,
    title: 'Hafif Risk Tespit Edildi',
    description: 'Son analizinizde öne eğik baş eğilimi gözlendi.',
    time: 'Dün',
    read: true,
    type: 'warning',
    icon: ShieldAlert,
  },
]

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Menü açıkken dışarı bir yere tıklandığında otomatik kapanması için
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const toggleRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Mevcut Bildirim Butonun */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
        aria-label="Bildirimler"
      >
        <Bell className="size-4.5" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-primary ring-2 ring-card animate-pulse" aria-hidden />
        )}
      </button>

      {/* Butona Basınca Açılan Dropdown Menü */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Üst Kısım */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-secondary/30">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Bildirimler</span>
              {unreadCount > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 font-medium">
                  {unreadCount} yeni
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Tümünü Oku
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bildirimlerin Listelendiği Alan */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Hiç bildiriminiz yok.
              </div>
            ) : (
              notifications.map((item) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleRead(item.id)}
                    className={`p-3.5 transition-colors flex items-start gap-3 cursor-pointer group ${
                      item.read ? 'bg-card opacity-70 hover:opacity-100' : 'bg-secondary/20 hover:bg-secondary/40'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      item.type === 'analysis' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                      item.type === 'exercise' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-semibold text-foreground truncate">{item.title}</h4>
                        <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
                    </div>

                    <button
                      onClick={(e) => deleteNotification(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 rounded transition-opacity cursor-pointer"
                      title="Bildirimi sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          {/* Alt Bilgi */}
          <div className="px-4 py-2 border-t border-border bg-secondary/20 text-center">
            <span className="text-[10px] text-muted-foreground">
              PostürApp Bildirim Merkezi
            </span>
          </div>

        </div>
      )}
    </div>
  )
}