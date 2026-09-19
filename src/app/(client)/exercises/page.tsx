'use client'

import { useEffect, useMemo, useState } from 'react'
import { Dumbbell, Play, Search, Signal } from 'lucide-react'
import { Panel } from '@/components/dashboard/panel'
import { useExercisePool } from '@/lib/use-exercise-pool'
import { DIFFICULTIES, type Difficulty } from '@/lib/exercise-pool'
import { cn } from '@/lib/utils'

const difficultyTone: Record<Difficulty, string> = {
  Kolay: 'bg-chart-3/10 text-chart-3',
  Orta: 'bg-chart-4/10 text-chart-4',
  Zor: 'bg-destructive/10 text-destructive',
}

export default function ExercisesPage() {
  const { pool } = useExercisePool()
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | 'Tümü'>('Tümü')
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(() => {
    try {
      setCompleted(JSON.parse(window.localStorage.getItem('posturapp.completed-exercises') ?? '[]'))
    } catch {
      /* yoksay */
    }
  }, [])

  const toggleDone = (id: string) => {
    const next = completed.includes(id) ? completed.filter((c) => c !== id) : [...completed, id]
    setCompleted(next)
    try {
      window.localStorage.setItem('posturapp.completed-exercises', JSON.stringify(next))
    } catch {
      /* yoksay */
    }
  }

  const filtered = useMemo(
    () =>
      pool.filter(
        (ex) =>
          (difficulty === 'Tümü' || ex.difficulty === difficulty) &&
          (ex.name.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR')) ||
            ex.targetMuscle.toLocaleLowerCase('tr-TR').includes(query.toLocaleLowerCase('tr-TR'))),
      ),
    [pool, query, difficulty],
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Egzersiz Programım</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ortak egzersiz havuzundan size atanan program · {pool.length} hareket
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Hareket veya kas grubu ara..."
            className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex gap-2">
          {(['Tümü', ...DIFFICULTIES] as const).map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setDifficulty(level as Difficulty | 'Tümü')}
              className={cn(
                'rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                difficulty === level
                  ? 'border-primary/50 bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => {
          const done = completed.includes(ex.id)
          return (
            <Panel key={ex.id} title={ex.name} description={ex.targetMuscle}>
              <div className="space-y-3">
                <div className="flex aspect-video items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
                  <div className="text-center">
                    <Play className="mx-auto size-8" aria-hidden />
                    <p className="mt-2 text-[11px]">{ex.videoUrl.split('/').pop()}</p>
                  </div>
                </div>
                <p className="text-xs leading-snug text-muted-foreground">{ex.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className={cn('rounded-full px-2.5 py-1 font-medium', difficultyTone[ex.difficulty])}>
                    {ex.difficulty}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
                    <Signal className="size-3" aria-hidden />
                    {ex.duration}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => toggleDone(ex.id)}
                  className={cn(
                    'flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                    done
                      ? 'bg-chart-3/10 text-chart-3'
                      : 'bg-primary/10 text-primary hover:bg-primary/20',
                  )}
                >
                  <Dumbbell className="size-3.5" aria-hidden />
                  {done ? 'Tamamlandı ✓' : 'Tamamlandı olarak işaretle'}
                </button>
              </div>
            </Panel>
          )
        })}
      </div>
    </div>
  )
}
