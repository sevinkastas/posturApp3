/**
 * Tarama Kılavuzu — merkezi içerik verisi
 *
 * Yönlendirme Asistanı (Adım Adım Kılavuz) için tüm metin/içerik tanımları
 * tek kaynaktan beslenir: GuidePanel, ScanProgressBar ve GuideDrawer
 * bu dosyayı kullanır.
 */

export type GuideAngle = 'front' | 'right' | 'back' | 'left'

/** Tarama sırası — ScanStage ile birebir aynı sıra (Ön → Sağ Yan → Arka → Sol Yan) */
export const POSITIONS: { id: GuideAngle; title: string; instruction: string }[] = [
  { id: 'front', title: 'Ön Pozisyon', instruction: 'Kameranın karşısında dik durun.' },
  { id: 'right', title: 'Sağ Yan Pozisyon', instruction: 'Sağ yanınız kameraya dönük durun.' },
  { id: 'back', title: 'Arka Pozisyon', instruction: 'Arkanız kameraya dönük durun.' },
  { id: 'left', title: 'Sol Yan Pozisyon', instruction: 'Sol yanınız kameraya dönük durun.' },
]

export interface GuideStepMeta {
  step: 1 | 2 | 3 | 4
  title: string
  shortLabel: string
  description: string
}

export const GUIDE_STEPS_META: GuideStepMeta[] = [
  {
    step: 1,
    title: 'Hazırlık & Konumlanma',
    shortLabel: 'Hazırlık',
    description: 'Doğru ölçüm için ortamınızı ve duruşunuzu hazırlayın.',
  },
  {
    step: 2,
    title: 'Açı Seçimi Rehberi',
    shortLabel: 'Açı',
    description: 'Taramada kullanılacak duruş açılarını öğrenin ve seçiminizi yapın.',
  },
  {
    step: 3,
    title: 'Canlı Tarama & Geri Bildirim',
    shortLabel: 'Tarama',
    description: 'Sabit durun — sistem iskelet eklemlerini yakalarken sizi yönlendirir.',
  },
  {
    step: 4,
    title: 'Sonuç & Egzersiz Yönlendirmesi',
    shortLabel: 'Sonuç',
    description: 'Risk skorlarınızı inceleyin, size atanan programa geçin.',
  },
]

export interface PrepCheckItem {
  id: string
  label: string
  hint: string
}

export const PREP_CHECKLIST: PrepCheckItem[] = [
  {
    id: 'cihaz-sabitle',
    label: 'Telefonu veya bilgisayarı sabit bir noktaya yerleştirin',
    hint: 'Tripod, raf ya da kitap desteği kullanın — cihaz tarama boyunca titrememelidir.',
  },
  {
    id: 'tam-boy',
    label: 'Tam boyunuzun görüneceğinden emin olun',
    hint: 'Başınızdan ayaklarınıza kadar tüm vücudunuz kadrajın içinde kalmalıdır.',
  },
  {
    id: 'aydinlatma',
    label: 'Ortamın iyi aydınlatıldığından emin olun',
    hint: 'Yüzünüzü ve vücudunuzu aydınlatan, arkadan vurmayan bir ışık tercih edin.',
  },
  {
    id: 'kiyafet-mesafe',
    label: 'Vücut hatlarını belli eden kıyafet giyip 2–3 metre geride durun',
    hint: 'Bol kıyafetler eklem algılamayı zorlaştırır; kameraya çok yaklaşmayın.',
  },
]

export interface AngleOption {
  id: GuideAngle
  title: string
  howTo: string
  tip: string
}

export const ANGLE_OPTIONS: AngleOption[] = [
  {
    id: 'front',
    title: 'Ön Açı',
    howTo: 'Kameraya yüzünüz dönük, ayaklar omuz genişliğinde açık, kollar yanda serbest durun.',
    tip: 'Tarama her zaman bu açıdan başlar.',
  },
  {
    id: 'right',
    title: 'Sağ Yan Profil',
    howTo: 'Kameraya sağ omzunuz dönük durun; başınız karşıya baksın, kamburlaşmayın.',
    tip: 'Yan profil analizi için omuz-kulak hizası kritiktir.',
  },
  {
    id: 'back',
    title: 'Arka Açı',
    howTo: 'Arkanız kameraya dönük, topuklar bitişik, omuzlar rahat ve simetrik durun.',
    tip: 'Kürek kemiği ve omurga simetrisi bu açıda ölçülür.',
  },
  {
    id: 'left',
    title: 'Sol Yan Profil',
    howTo: 'Kameraya sol omzunuz dönük durun; sağ yan profildeki duruşu aynen tekrarlayın.',
    tip: 'İki yan profil karşılaştırılarak asimetri tespit edilir.',
  },
]

export interface GuideVideo {
  id: string
  title: string
  duration: string
  description: string
}

export const GUIDE_VIDEOS: GuideVideo[] = [
  {
    id: 'video-hazirlik',
    title: 'Hazırlık ve Konumlanma Anlatımı',
    duration: '2:10',
    description: 'Cihaz yerleşimi, mesafe ayarı ve kadraja giriş adım adım gösterilir.',
  },
  {
    id: 'video-aci',
    title: 'Doğru Açı Seçimi',
    duration: '1:45',
    description: 'Ön, yan ve arka duruşlarda vücudunuzu nasıl konumlandıracağınız anlatılır.',
  },
  {
    id: 'video-tarama',
    title: 'Tarama Sırasında Dikkat Edilecekler',
    duration: '3:05',
    description: '3 saniyelik sabit duruş, nefes kontrolü ve yaygın hatalardan kaçınma.',
  },
]

export const GUIDE_TIPS: string[] = [
  'Tarama boyunca konuşmamaya ve çiğneme hareketi yapmamaya çalışın.',
  'Her pozisyonda sayaç bitene kadar gözlerinizi tek noktaya sabitleyin.',
  'Kadraj uyarısı alırsanız yavaşça merkeze yürüyün, ani hareket etmeyin.',
  'Aynı ışık ve mesafede haftada 1 tarama, ilerlemeyi en sağlıklı gösterir.',
  'Sonuçtaki risk oranları ön değerlendirmedir; egzersizlere düzenli devam edin.',
]
