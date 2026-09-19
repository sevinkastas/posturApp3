'use client'

import { useCallback, useEffect, useState } from 'react'
import type { PoolExercise } from '@/lib/exercise-pool'
import {
  addExercise,
  readPool,
  removeExercise,
  updateExercise,
} from '@/lib/exercise-pool'

/** Egzersiz havuzuna reaktif erişim (admin CRUD + panel okuma) */
export function useExercisePool() {
  const [pool, setPool] = useState<PoolExercise[]>([])

  useEffect(() => {
    setPool(readPool())
  }, [])

  const refresh = useCallback(() => setPool(readPool()), [])

  const add = useCallback((input: Parameters<typeof addExercise>[0]) => {
    addExercise(input)
    setPool(readPool())
  }, [])

  const update = useCallback((id: string, patch: Partial<PoolExercise>) => {
    updateExercise(id, patch)
    setPool(readPool())
  }, [])

  const remove = useCallback((id: string) => {
    removeExercise(id)
    setPool(readPool())
  }, [])

  return { pool, refresh, add, update, remove }
}
