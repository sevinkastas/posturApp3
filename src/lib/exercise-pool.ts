/**
 * Ortak egzersiz havuzu — admin tarafından yönetilir, danışan/uzman panelleri okur.
 * (demo — localStorage)
 */

export type Difficulty = 'Kolay' | 'Orta' | 'Zor'

export interface PoolExercise {
  id: string
  name: string
  videoUrl: string
  description: string
  targetMuscle: string
  difficulty: Difficulty
  duration: string
  updatedAt: string
}

export const DIFFICULTIES: Difficulty[] = ['Kolay', 'Orta', 'Zor']

const POOL_KEY = 'posturapp.exercise-pool'

const DEFAULT_POOL: PoolExercise[] = [
  {
    id: 'ex-1',
    name: 'Çene Geri Çekme (Chin Tuck)',
    videoUrl: 'https://cdn.posturapp.com/videos/chin-tuck.mp4',
    description:
      'Başı öne doğru çeken derin boyun flexörlerini aktive eder. Duvara yaslanarak 10 tekrar.',
    targetMuscle: 'Derin Boyun Flexörleri',
    difficulty: 'Kolay',
    duration: '5 dk',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-2',
    name: 'Kürek Sıkıştırma',
    videoUrl: 'https://cdn.posturapp.com/videos/scapular-squeeze.mp4',
    description:
      'Omuz küreklerini birbirine yaklaştırarak orta sırt kaslarını güçlendirir. 12 tekrar x 2 set.',
    targetMuscle: 'Rhomboid / Orta Trapes',
    difficulty: 'Kolay',
    duration: '6 dk',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-3',
    name: 'Göğüs Duvarı Açma',
    videoUrl: 'https://cdn.posturapp.com/videos/chest-opener.mp4',
    description:
      'Kısalan pektoralleri uzatır, yuvarlak omuz duruşunu düzeltir. 30 sn x 3 tekrar.',
    targetMuscle: 'Pektoralis Major/Minor',
    difficulty: 'Orta',
    duration: '4 dk',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-4',
    name: 'Bird-Dog Stabilizasyon',
    videoUrl: 'https://cdn.posturapp.com/videos/bird-dog.mp4',
    description:
      'Karın ve sırt uzantılarını eş zamanlı çalıştırır, lombar stabilite sağlar. 8 tekrar x 2 set.',
    targetMuscle: 'Core / Multifidus',
    difficulty: 'Orta',
    duration: '8 dk',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-5',
    name: 'Köprü (Glute Bridge)',
    videoUrl: 'https://cdn.posturapp.com/videos/glute-bridge.mp4',
    description:
      'Pasif kalça ekstansörlerini aktive ederek pelvik eğimi düzeltir. 15 tekrar x 3 set.',
    targetMuscle: 'Gluteus Maximus',
    difficulty: 'Kolay',
    duration: '7 dk',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ex-6',
    name: 'Yoga Köpeği (Downward Dog)',
    videoUrl: 'https://cdn.posturapp.com/videos/downward-dog.mp4',
    description:
      'Tüm posterior zinciri esnetir, kifotik duruş için temel hareket. 45 sn x 3 tekrar.',
    targetMuscle: 'Hamstring / Latissimus',
    difficulty: 'Zor',
    duration: '6 dk',
    updatedAt: new Date().toISOString(),
  },
]

export function readPool(): PoolExercise[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(POOL_KEY)
    if (!raw) {
      window.localStorage.setItem(POOL_KEY, JSON.stringify(DEFAULT_POOL))
      return [...DEFAULT_POOL]
    }
    return JSON.parse(raw) as PoolExercise[]
  } catch {
    return []
  }
}

export function writePool(pool: PoolExercise[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(POOL_KEY, JSON.stringify(pool))
  } catch {
    /* yoksay */
  }
}

export function addExercise(
  input: Omit<PoolExercise, 'id' | 'updatedAt'>,
): PoolExercise {
  const exercise: PoolExercise = {
    ...input,
    id: `ex-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    updatedAt: new Date().toISOString(),
  }
  writePool([exercise, ...readPool()])
  return exercise
}

export function updateExercise(id: string, patch: Partial<PoolExercise>): void {
  writePool(
    readPool().map((ex) =>
      ex.id === id ? { ...ex, ...patch, updatedAt: new Date().toISOString() } : ex,
    ),
  )
}

export function removeExercise(id: string): void {
  writePool(readPool().filter((ex) => ex.id !== id))
}
