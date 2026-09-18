'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Target, Shield, Edit3, Save, CheckCircle2 } from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [savedMessage, setSavedMessage] = useState(false)

  // Demo profil verileri
  const [profile, setProfile] = useState({
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@ornek.com',
    phone: '+90 (555) 123 45 67',
    location: 'İstanbul, Türkiye',
    height: '178 cm',
    weight: '74 kg',
    age: '28',
    primaryGoal: 'Boyun ve sırt postürünü düzeltmek, ofis ağrılarını azaltmak',
    postureType: 'Hafif Torakal Kifoz / Forward Head',
  })

  const handleSave = () => {
    setIsEditing(false)
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 3000)
  }

  return (
    <div className="space-y-6 relative">
      {/* Sayfa Başlığı ve Açıklaması */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Profil</h1>
          <p className="text-sm text-muted-foreground mt-1">Kişisel bilgilerini, hedeflerini ve sağlık geçmişini yönet.</p>
        </div>

        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity self-start sm:self-auto cursor-pointer"
        >
          {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
          {isEditing ? 'Değişiklikleri Kaydet' : 'Profili Düzenle'}
        </button>
      </div>

      {/* Kaydedildi Bildirimi */}
      {savedMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>Profil bilgileriniz başarıyla güncellendi (Demo).</span>
        </div>
      )}

      {/* Üst Bilgi Kartı (Avatar ve Temel Kimlik) */}
      <div className="rounded-2xl border border-border bg-card p-6 backdrop-blur-sm flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-chart-3 flex items-center justify-center text-primary-foreground text-3xl font-extrabold shadow-lg">
            AY
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center text-[10px] text-slate-950 font-bold">
            ✓
          </div>
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium self-center md:self-auto">
              Aktif Danışan
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">PostürApp AI Sağlık ve Egzersiz Takip Sistemi</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-xs text-secondary-foreground">
            <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border">
              <Mail className="w-3.5 h-3.5 text-primary" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/30 px-3 py-1.5 rounded-xl border border-border">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>{profile.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detaylı Bilgi Alanları Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol 2 Kolon: Kişisel Bilgiler & Fiziksel Değerler */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Kişisel ve Fiziksel Bilgiler
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground disabled:opacity-60 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">E-posta Adresi</label>
                <input
                  type="email"
                  disabled={!isEditing}
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground disabled:opacity-60 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground disabled:opacity-60 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Konum</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground disabled:opacity-60 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Boy</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.height}
                  onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground disabled:opacity-60 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground block mb-1">Kilo</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={profile.weight}
                  onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                  className="w-full bg-secondary/30 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground disabled:opacity-60 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sağ 1 Kolon: Hedefler ve Sağlık Durumu */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Postür Hedefleri
            </h3>
            
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Birincil Hedef</label>
              <textarea
                disabled={!isEditing}
                rows={3}
                value={profile.primaryGoal}
                onChange={(e) => setProfile({ ...profile, primaryGoal: e.target.value })}
                className="w-full bg-secondary/30 border border-border rounded-xl p-3 text-xs text-foreground disabled:opacity-60 focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm space-y-4 shadow-sm">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Sağlık Geçmişi & Notlar
            </h3>

            <div className="p-3.5 rounded-xl bg-secondary/30 border border-border">
              <span className="text-[11px] text-muted-foreground block">Tespit Edilen Durum</span>
              <span className="text-xs font-semibold text-amber-400 mt-1 block">{profile.postureType}</span>
            </div>

            <p className="text-xs text-muted-foreground">
              Geçmiş tarama sonuçlarınıza göre oluşturulan bu etiket, günlük egzersiz programınızın AI tarafından optimize edilmesini sağlar.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}