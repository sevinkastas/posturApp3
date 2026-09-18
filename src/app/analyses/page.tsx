'use client'

import { useState } from 'react'
import { Activity, Calendar, ArrowUpRight, ShieldAlert, CheckCircle2, FileText, X, AlertTriangle, Check } from 'lucide-react'

// Örnek demo analiz verileri (detaylı rapor alanlarıyla zenginleştirildi)
const mockAnalyses = [
  {
    id: 1,
    date: '14 Mayıs 2026',
    score: 88,
    status: 'İyi Durumda',
    statusColor: 'text-chart-3 bg-chart-3/10 border-chart-3/20',
    icon: CheckCircle2,
    details: 'Boyun ve omuz hizası ideal açıda.',
    metrics: {
      headAngle: '2° (Normal)',
      shoulderTilt: '1 mm (Dengeli)',
      spineAlignment: 'Düzgün',
    },
    recommendations: [
      'Günlük rutin egzersizlerinize aynı şekilde devam edin.',
      'Çalışırken ekran yüksekliğinizi göz hizasında tutmaya özen gösterin.',
    ]
  },
  {
    id: 2,
    date: '28 Nisan 2026',
    score: 74,
    status: 'Hafif Risk',
    statusColor: 'text-primary bg-primary/10 border-primary/20',
    icon: ShieldAlert,
    details: 'Öne eğik baş (forward head posture) eğilimi tespit edildi.',
    metrics: {
      headAngle: '12° (Hafif İleri)',
      shoulderTilt: '5 mm (Sol Omuz Düşük)',
      spineAlignment: 'Hafif Kifotik Eğilim',
    },
    recommendations: [
      'Günde 2 kez Chin Tuck egzersizini 3 set tekrarlayın.',
      'Masa başı molalarını artırarak sırt germe hareketleri yapın.',
    ]
  },
  {
    id: 3,
    date: '10 Nisan 2026',
    score: 65,
    status: 'Dikkat Edilmeli',
    statusColor: 'text-destructive bg-destructive/10 border-destructive/20',
    icon: ShieldAlert,
    details: 'Skapula dengesizliği ve sırt asimetrisi gözlendi.',
    metrics: {
      headAngle: '18° (Belirgin İleri)',
      shoulderTilt: '12 mm (Asimetrik Omuzlar)',
      spineAlignment: 'Belirgin Torakal Kifoz',
    },
    recommendations: [
      'Wall Angels ve Thoracic Extension egzersizlerine ağırlık verin.',
      'Uzman bir fizyoterapist eşliğinde detaylı değerlendirme planlayın.',
    ]
  },
]

export default function AnalysesPage() {
  const [selectedAnalysis, setSelectedAnalysis] = useState<typeof mockAnalyses[0] | null>(null)

  return (
    <div className="space-y-6 relative">
      {/* Sayfa Başlığı ve Açıklaması */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analizlerim</h1>
        <p className="text-sm text-muted-foreground mt-1">Geçmiş postür analizlerini ve skor değişimini takip et.</p>
      </div>

      {/* Özet Kartları */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Son Postür Skoru</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">88</span>
            <span className="text-xs font-medium text-chart-3 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-0.5" /> +14 puan
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Bir önceki analize göre artış var</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Toplam Tarama</span>
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">12</div>
          <p className="mt-1 text-xs text-muted-foreground">Son 3 ay içerisinde gerçekleştirildi</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Genel Durum</span>
            <CheckCircle2 className="h-4 w-4 text-chart-3" />
          </div>
          <div className="mt-2 text-xl font-bold text-chart-3">İyileşme Trendinde</div>
          <p className="mt-1 text-xs text-muted-foreground">Egzersizler olumlu yansıyor</p>
        </div>
      </div>

      {/* Geçmiş Analizler Listesi */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Analiz Geçmişi</h2>
          <span className="text-xs text-muted-foreground">Demo Veri</span>
        </div>

        <div className="space-y-3">
          {mockAnalyses.map((item) => {
            const StatusIcon = item.icon
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> {item.date}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${item.statusColor}`}>
                        <StatusIcon className="h-3 w-3" /> {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Skor</span>
                    <span className="text-lg font-bold text-foreground">{item.score}/100</span>
                  </div>
                  <button
                    onClick={() => setSelectedAnalysis(item)}
                    className="px-3 py-1.5 text-xs font-medium rounded-xl bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer"
                  >
                    Raporu Gör
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detaylı Rapor Modal (Popup) Yapısı */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">

            {/* Kapatma Butonu */}
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Başlık */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-primary font-medium">Tarama Raporu Detayı</span>
                <h3 className="text-lg font-bold text-foreground">{selectedAnalysis.date}</h3>
              </div>
            </div>

            {/* Skor ve Durum Özeti */}
            <div className="grid grid-cols-2 gap-4 bg-secondary/30 p-4 rounded-xl border border-border">
              <div>
                <span className="text-xs text-muted-foreground block">Postür Skoru</span>
                <span className="text-2xl font-extrabold text-foreground">{selectedAnalysis.score}/100</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Genel Değerlendirme</span>
                <span className={`inline-block mt-1 text-xs px-2.5 py-1 rounded-full border font-medium ${selectedAnalysis.statusColor}`}>
                  {selectedAnalysis.status}
                </span>
              </div>
            </div>

            {/* Ölçüm Metrikleri */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Biyomekanik Ölçümler</h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-muted-foreground">Baş Açısı (Head Tilt):</span>
                  <span className="font-medium text-foreground">{selectedAnalysis.metrics.headAngle}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-muted-foreground">Omuz Simetrisi:</span>
                  <span className="font-medium text-foreground">{selectedAnalysis.metrics.shoulderTilt}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-muted-foreground">Omurga Dizilimi:</span>
                  <span className="font-medium text-foreground">{selectedAnalysis.metrics.spineAlignment}</span>
                </div>
              </div>
            </div>

            {/* Uzman / AI Tavsiyeleri */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">AI Öneri ve Tavsiyeler</h4>
              <ul className="space-y-2 text-xs text-foreground">
                {selectedAnalysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 bg-secondary/30 p-2.5 rounded-xl border border-border">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kapat / Tamam Butonu */}
            <button
              onClick={() => setSelectedAnalysis(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors"
            >
              Raporu Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  )
}