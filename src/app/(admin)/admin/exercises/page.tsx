'use client'

import { useState } from 'react'
import { Plus, Search, Trash2, Pencil } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { useExercisePool } from '@/lib/use-exercise-pool'
import { DIFFICULTIES, type Difficulty, type PoolExercise } from '@/lib/exercise-pool'
import { cn } from '@/lib/utils'

const DIFF_TONE: Record<Difficulty, string> = {
  Kolay: 'bg-chart-3/10 text-chart-3',
  Orta: 'bg-chart-4/10 text-chart-4',
  Zor: 'bg-destructive/10 text-destructive',
}

/**
 * Admin / Egzersiz Havuzu — ortak egzersiz havuzunun içeriklerini
 * (video, açıklama, hedef kas grubu, zorluk seviyesi) yönetir.
 */
export default function AdminExercisesPage() {
  const { pool, add, update, remove } = useExercisePool()
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | 'Tümü'>('Tümü')
  const [editing, setEditing] = useState<PoolExercise | null>(null)
  const [showAdd, setShowAdd] = useState(false)

  const filtered = pool.filter(
    (ex) =>
      (difficulty === 'Tümü' || ex.difficulty === difficulty) &&
      (ex.name.toLowerCase().includes(query.toLowerCase()) ||
        ex.targetMuscle.toLowerCase().includes(query.toLowerCase())),
  )

  const readForm = (form: HTMLFormElement) => ({
    name: (form.elements.namedItem('name') as HTMLInputElement).value.trim(),
    videoUrl: (form.elements.namedItem('videoUrl') as HTMLInputElement).value.trim(),
    description: (form.elements.namedItem('description') as HTMLTextAreaElement).value.trim(),
    targetMuscle: (form.elements.namedItem('targetMuscle') as HTMLInputElement).value.trim(),
    difficulty: (form.elements.namedItem('difficulty') as HTMLSelectElement).value as Difficulty,
    duration: (form.elements.namedItem('duration') as HTMLInputElement).value.trim() || '5 dk',
  })

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    add(readForm(e.currentTarget))
    setShowAdd(false)
  }

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editing) return
    update(editing.id, readForm(e.currentTarget))
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Egzersiz Havuzu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sistemde ortak kullanılacak sabit egzersiz havuzunu yönetin
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hareket veya kas grubu ara..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(['Tümü', ...DIFFICULTIES] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficulty(d as Difficulty | 'Tümü')}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                difficulty === d
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" aria-hidden /> Ekle
          </button>
        </div>
      </div>

      {showAdd && (
        <ExerciseForm title="Yeni Egzersiz Ekle" onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
      )}

      {editing && (
        <ExerciseForm
          title="Egzersiz Düzenle"
          exercise={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
        />
      )}

      <Panel title="Hareketler" description={`${filtered.length} egzersiz`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 font-medium text-muted-foreground">Hareket</th>
                <th className="pb-2 font-medium text-muted-foreground">Kas Grubu</th>
                <th className="pb-2 font-medium text-muted-foreground">Zorluk</th>
                <th className="pb-2 font-medium text-muted-foreground">Süre</th>
                <th className="pb-2 text-right font-medium text-muted-foreground">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ex) => (
                <tr key={ex.id} className="border-b border-border/50">
                  <td className="py-3 font-medium">{ex.name}</td>
                  <td className="py-3 text-muted-foreground">{ex.targetMuscle}</td>
                  <td className="py-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', DIFF_TONE[ex.difficulty])}>
                      {ex.difficulty}
                    </span>
                  </td>
                  <td className="py-3 text-muted-foreground">{ex.duration}</td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(ex)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Düzenle"
                      >
                        <Pencil className="size-3.5" aria-hidden />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(ex.id)}
                        className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Sil"
                      >
                        <Trash2 className="size-3.5" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">Egzersiz bulunamadı.</p>
          )}
        </div>
      </Panel>
    </div>
  )
}
function ExerciseForm({
  title,
  exercise,
  onSubmit,
  onCancel,
}: {
  title: string
  exercise?: PoolExercise
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}) {
  return (
    <Panel title={title} description="Video, açıklama, hedef kas grubu ve zorluk seviyesi">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Hareket Adı</label>
          <input
            name="name"
            defaultValue={exercise?.name}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Video URL</label>
          <input
            name="videoUrl"
            defaultValue={exercise?.videoUrl}
            placeholder="https://cdn.posturapp.com/videos/..."
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Açıklama</label>
          <textarea
            name="description"
            defaultValue={exercise?.description}
            required
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Hedef Kas Grubu</label>
            <input
              name="targetMuscle"
              defaultValue={exercise?.targetMuscle}
              required
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Süre</label>
            <input
              name="duration"
              defaultValue={exercise?.duration}
              placeholder="5 dk"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Zorluk Seviyesi</label>
          <select
            name="difficulty"
            defaultValue={exercise?.difficulty}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
            {exercise ? 'Güncelle' : 'Ekle'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground"
          >
            İptal
          </button>
        </div>
      </form>
    </Panel>
  )
}
