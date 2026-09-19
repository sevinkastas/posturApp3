/** Danışan portföyü demo verisi — backend bağlandığında API'den gelmeli */

export interface ClientRecord {
  id: string
  name: string
  email: string
  phone: string
  city: string
  status: 'İyileşiyor' | 'İzlemede' | 'Dikkat'
  lastScan: { date: string; score: number; metrics: { label: string; value: string }[] }
  progress: { month: string; score: number }[]
}

export const CLIENTS: ClientRecord[] = [
  {
    id: 'c1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@ornek.com',
    phone: '0532 111 22 33',
    city: 'İstanbul',
    status: 'İyileşiyor',
    lastScan: {
      date: '14 Eylül',
      score: 78,
      metrics: [
        { label: 'Omurga Eğriliği', value: 'Normal' },
        { label: 'Servikal Açı', value: '48° (hafif)' },
        { label: 'Pelvik Eğim', value: 'Dengeli' },
      ],
    },
    progress: [
      { month: 'Haz', score: 58 },
      { month: 'Tem', score: 65 },
      { month: 'Ağu', score: 71 },
      { month: 'Eyl', score: 78 },
    ],
  },
  {
    id: 'c2',
    name: 'Zeynep Kaya',
    email: 'zeynep.kaya@ornek.com',
    phone: '0533 444 55 66',
    city: 'Ankara',
    status: 'İzlemede',
    lastScan: {
      date: '12 Eylül',
      score: 64,
      metrics: [
        { label: 'Skolyoz Açısı', value: '9° Cobb' },
        { label: 'Omuz Hizası', value: 'Hafif asimetri' },
        { label: 'Bel Çukuru', value: 'Artmış' },
      ],
    },
    progress: [
      { month: 'Haz', score: 60 },
      { month: 'Tem', score: 59 },
      { month: 'Ağu', score: 62 },
      { month: 'Eyl', score: 64 },
    ],
  },
  {
    id: 'c3',
    name: 'Mert Demir',
    email: 'mert.demir@ornek.com',
    phone: '0534 777 88 99',
    city: 'İzmir',
    status: 'İyileşiyor',
    lastScan: {
      date: '10 Eylül',
      score: 71,
      metrics: [
        { label: 'Omuz Asimetrisi', value: '1.2 cm' },
        { label: 'Baş İlerlemesi', value: 'Hafif öne' },
        { label: 'Göğüs Ekspansiyonu', value: 'Normal' },
      ],
    },
    progress: [
      { month: 'Haz', score: 55 },
      { month: 'Tem', score: 60 },
      { month: 'Ağu', score: 66 },
      { month: 'Eyl', score: 71 },
    ],
  },
  {
    id: 'c4',
    name: 'Elif Şahin',
    email: 'elif.sahin@ornek.com',
    phone: '0535 222 33 44',
    city: 'Bursa',
    status: 'Dikkat',
    lastScan: {
      date: '08 Eylül',
      score: 55,
      metrics: [
        { label: 'Torakal Kifoz', value: 'Artmış' },
        { label: 'Omurga Eğriliği', value: 'İzlemeli' },
        { label: 'Esneklik', value: 'Kısıtlı' },
      ],
    },
    progress: [
      { month: 'Haz', score: 52 },
      { month: 'Tem', score: 51 },
      { month: 'Ağu', score: 53 },
      { month: 'Eyl', score: 55 },
    ],
  },
]
