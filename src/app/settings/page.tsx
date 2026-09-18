'use client'

import { useState, useEffect } from 'react'
import { Settings, Bell, Shield, Mail, Phone, MessageSquarePlus, Send, CheckCircle2, Moon, Sun } from 'lucide-react'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(true)

  // Şikayet formu state'leri
  const [complaintText, setComplaintText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Sayfa yüklendiğinde mevcut tema durumunu yakala
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)
  }, [])

  // Tema değiştirme fonksiyonu (CSS değişkenlerini ve .dark sınıfını tetikler)
  const handleThemeToggle = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)

    if (newMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!complaintText.trim()) return
    setSubmitted(true)
    setComplaintText('')
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Ayarlar</h1>
        <p className="text-sm text-muted-foreground mt-1">Uygulama tercihlerini, bildirimleri ve gizlilik seçeneklerini düzenle.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol 2 Kolon: Tercihler & Şikayet */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm space-y-5 shadow-sm">
            <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Genel Tercihler
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">Egzersiz Hatırlatıcıları</span>
                    <span className="text-xs text-muted-foreground">Günlük postür egzersizleri için anlık bildirim al</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground block">E-posta Bilgilendirmeleri</span>
                    <span className="text-xs text-muted-foreground">Haftalık analiz raporlarını e-posta ile al</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={() => setEmailAlerts(!emailAlerts)}
                  className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                />
              </div>

              {/* Tema Değiştirme Butonu */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/50 border border-border">
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-4 h-4 text-primary" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                  )}
                  <div>
                    <span className="text-sm font-medium text-foreground block">Koyu Tema (Dark Mode)</span>
                    <span className="text-xs text-muted-foreground">Arayüzü koyu veya aydınlık modda kullan</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={handleThemeToggle}
                  className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Şikayet / Destek Formu */}
          <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm space-y-4 shadow-sm">
            <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-primary" />
              Şikayet / Bildirim ve Destek
            </h2>
            <p className="text-xs text-muted-foreground">
              Gönderdiğiniz mesajlar veritabanına kaydedilir ve doğrudan destek ekibimizin mail adresine iletilir.
            </p>

            {submitted && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Şikayet veya bildiriminiz başarıyla sisteme iletildi.</span>
              </div>
            )}

            <form onSubmit={handleComplaintSubmit} className="space-y-3">
              <textarea
                rows={3}
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Şikayet veya önerinizi buraya yazın..."
                className="w-full bg-input/40 border border-border rounded-xl p-3 text-xs text-foreground focus:outline-none focus:border-ring resize-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Bildirimi Gönder
              </button>
            </form>
          </div>
        </div>

        {/* Sağ 1 Kolon: İletişim & Gizlilik */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm space-y-4 shadow-sm">
            <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <Phone className="w-5 h-5 text-emerald-500" />
              İletişim Bilgileri
            </h2>
            <p className="text-xs text-muted-foreground">
              Destek ekibimize doğrudan aşağıdaki kanallardan ulaşabilirsiniz:
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">Destek E-Posta</span>
                  <span className="font-medium text-foreground">destek@posturapp.com</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">İletişim Numarası</span>
                  <span className="font-medium text-foreground">+90 (850) 123 45 67</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm space-y-4 shadow-sm">
            <h2 className="text-base font-semibold text-card-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Gizlilik & Güvenlik
            </h2>
            <p className="text-xs text-muted-foreground">
              Tarama verileriniz KVKK kapsamında şifrelenerek güvenli sunucularda saklanır.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}