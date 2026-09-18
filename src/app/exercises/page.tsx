import { Dumbbell, CheckCircle2, Clock, Flame, PlayCircle, CalendarCheck, Trophy, XCircle } from 'lucide-react'

// Demo haftalık tamamlama verileri
const weeklyActivity = [
  { day: 'Pazartesi', date: 'Pzt', completed: true, count: 4 },
  { day: 'Salı', date: 'Sal', completed: true, count: 3 },
  { day: 'Çarşamba', date: 'Çar', completed: false, count: 0 },
  { day: 'Perşembe', date: 'Per', completed: true, count: 4 },
  { day: 'Cuma', date: 'Cum', completed: true, count: 4 },
  { day: 'Cumartesi', date: 'Cmt', completed: false, count: 1 },
  { day: 'Pazar', date: 'Paz', completed: false, count: 0 },
]

// Demo egzersiz verileri
const demoExercises = [
  {
    id: 1,
    title: 'Chin Tuck (Boyun Düzeltme)',
    duration: '3 Set x 12 Tekrar',
    target: 'Boyun ve Servikal Bölge',
    difficulty: 'Kolay',
    calories: '45 kcal',
    completed: true,
  },
  {
    id: 2,
    title: 'Wall Angels (Duvar Melekleri)',
    duration: '3 Set x 10 Tekrar',
    target: 'Üst Sırt ve Omuzlar',
    difficulty: 'Orta',
    calories: '60 kcal',
    completed: false,
  },
  {
    id: 3,
    title: 'Thoracic Extension (Göğüs Kafesi Açma)',
    duration: '2 Set x 15 Tekrar',
    target: 'Göğüs ve Torakal Bölge',
    difficulty: 'Kolay',
    calories: '40 kcal',
    completed: false,
  },
  {
    id: 4,
    title: 'Plank (Core Güçlendirme)',
    duration: '3 Set x 45 Saniye',
    target: 'Karın ve Merkez Bölge',
    difficulty: 'Zor',
    calories: '80 kcal',
    completed: false,
  },
]

export default function ExercisesPage() {
  return (
    <div className="space-y-6">
      {/* Sayfa Başlığı */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Egzersizler</h1>
        <p className="text-sm text-muted-foreground mt-1">Postürüne özel hazırlanmış günlük egzersiz programın ve aktivite geçmişin.</p>
      </div>

      {/* 1. Bölüm: Haftalık Tamamlama Grafiği */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Haftalık Tamamlama Grafiği</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Son 7 günlük postür egzersizi rutin takibi (Demo Veri)</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary/30 border border-border px-3.5 py-2 rounded-xl">
              <Flame className="w-4 h-4 text-chart-4" />
              <div className="text-xs">
                <span className="text-muted-foreground block">Seri (Streak)</span>
                <span className="font-semibold text-foreground">4 Gün</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-secondary/30 border border-border px-3.5 py-2 rounded-xl">
              <Trophy className="w-4 h-4 text-primary" />
              <div className="text-xs">
                <span className="text-muted-foreground block">Başarı Oranı</span>
                <span className="font-semibold text-primary">%71</span>
              </div>
            </div>
          </div>
        </div>

        {/* Günlük Görsel Çubuk / Durum Grafiği */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {weeklyActivity.map((item, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 ${
                item.completed
                  ? 'bg-primary/10 border-primary/20 hover:border-primary/40'
                  : 'bg-secondary/20 border-border hover:border-muted-foreground/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-foreground">{item.day}</span>
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                ) : (
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                )}
              </div>

              <div className="my-2">
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.completed ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                    style={{ width: item.completed ? '100%' : '20%' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                <span>Tamamlanan:</span>
                <span className={`font-semibold ${item.completed ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.count}/4
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Bölüm: Günlük Egzersiz Listesi / Kartları */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-primary" />
              Bugünün Postür Programı
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Backend bağlantısı yapılana kadar örnek egzersizler listelenmektedir.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-xl border border-border">
            <span className="text-xs text-muted-foreground">Günlük İlerleme:</span>
            <span className="text-sm font-medium text-primary">%25 Tamamlandı</span>
          </div>
        </div>

        {/* Egzersiz Kartları Grid Yapısı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoExercises.map((exercise) => (
            <div
              key={exercise.id}
              className={`group relative rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                exercise.completed
                  ? 'bg-primary/10 border-primary/20'
                  : 'bg-secondary/30 border-border hover:border-primary/30'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${exercise.completed ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                      {exercise.completed ? <CheckCircle2 className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground group-hover:text-primary transition-colors text-sm">
                        {exercise.title}
                      </h3>
                      <span className="text-xs text-primary font-medium">
                        {exercise.target}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${
                    exercise.difficulty === 'Kolay' ? 'bg-chart-3/10 text-chart-3 border border-chart-3/20' :
                    exercise.difficulty === 'Orta' ? 'bg-primary/10 text-primary border border-primary/20' :
                    'bg-destructive/10 text-destructive border border-destructive/20'
                  }`}>
                    {exercise.difficulty}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 my-4 text-xs text-muted-foreground bg-secondary/30 p-2.5 rounded-xl border border-border">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{exercise.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-muted-foreground" />
                    <span>{exercise.calories}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`w-full mt-2 py-2 px-4 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-2 ${
                  exercise.completed
                    ? 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 font-semibold'
                }`}
              >
                {exercise.completed ? 'Tekrar İzle / Gözden Geçir' : 'Egzersize Başla'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}