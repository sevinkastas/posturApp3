'use client'
import { createContext, useCallback, useContext } from 'react'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { PREP_CHECKLIST } from '@/lib/guide-content'
import type { GuideAngle } from '@/lib/guide-content'
export type GuideStepId = 1 | 2 | 3 | 4
export type ScanPhase = 'idle' | 'framing' | 'scanning' | 'completed'
interface PersistedGuideState {
  prepChecks: Record<string, boolean>
  selectedAngle: GuideAngle | null
  activeStep: GuideStepId
  lastScore: number | null
  lastCompletedAt: string | null
}
const STORAGE_KEY = 'posturapp.guide-state'
const DEFAULTS: PersistedGuideState = {
  prepChecks: {},
  selectedAngle: null,
  activeStep: 1,
  lastScore: null,
  lastCompletedAt: null,
}
function readPersisted(): PersistedGuideState {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    const parsed = JSON.parse(raw) as Partial<PersistedGuideState>
    const s = parsed.activeStep
    return {
      prepChecks: parsed.prepChecks ?? {},
      selectedAngle: parsed.selectedAngle ?? null,
      activeStep: s === 1 || s === 2 || s === 3 || s === 4 ? s : 1,
      lastScore: typeof parsed.lastScore === 'number' ? parsed.lastScore : null,
      lastCompletedAt: parsed.lastCompletedAt ?? null,
    }
  } catch {
    return DEFAULTS
  }
}
interface GuideContextValue extends PersistedGuideState {
  prepDone: boolean
  angleDone: boolean
  canStartScan: boolean
  progressPercent: number
  scanPhase: ScanPhase
  scanPosIndex: number
  scanPosTotal: number
  drawerOpen: boolean
  collapsed: boolean
  togglePrep: (id: string) => void
  selectAngle: (angle: GuideAngle) => void
  setActiveStep: (step: GuideStepId) => void
  nextStep: () => void
  prevStep: () => void
  setScanPhase: (phase: ScanPhase) => void
  setScanProgress: (index: number, total: number) => void
  setLastScore: (score: number) => void
  openDrawer: () => void
  closeDrawer: () => void
  toggleCollapsed: () => void
  resetGuide: () => void
}
const GuideContext = createContext<GuideContextValue | null>(null)
export function GuideProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<PersistedGuideState>(DEFAULTS)
  const [hydrated, setHydrated] = useState(false)
  const [scanPhase, setScanPhaseState] = useState<ScanPhase>('idle')
  const [scanPosIndex, setScanPosIndex] = useState(0)
  const [scanPosTotal, setScanPosTotal] = useState(4)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    setPersisted(readPersisted())
    setHydrated(true)
  }, [])
  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted))
    } catch {
      /* yoksay */
    }
  }, [persisted, hydrated])
  const togglePrep = useCallback((id: string) => {
    setPersisted((p) => ({ ...p, prepChecks: { ...p.prepChecks, [id]: !p.prepChecks[id] } }))
  }, [])
  const selectAngle = useCallback((a: GuideAngle) => {
    setPersisted((p) => ({ ...p, selectedAngle: a }))
  }, [])
  const setActiveStep = useCallback((s: GuideStepId) => {
    setPersisted((p) => ({ ...p, activeStep: s }))
  }, [])
  const nextStep = useCallback(() => {
    setPersisted((p) => ({ ...p, activeStep: Math.min(4, p.activeStep + 1) as GuideStepId }))
  }, [])
  const prevStep = useCallback(() => {
    setPersisted((p) => ({ ...p, activeStep: Math.max(1, p.activeStep - 1) as GuideStepId }))
  }, [])
  const setScanPhase = useCallback((phase: ScanPhase) => {
    setScanPhaseState(phase)
    setPersisted((p) => {
      if (phase === 'completed') return { ...p, activeStep: 4, lastCompletedAt: new Date().toISOString() }
      if ((phase === 'framing' || phase === 'scanning') && p.activeStep < 3) return { ...p, activeStep: 3 }
      return p
    })
  }, [])
  const setScanProgress = useCallback((i: number, t: number) => {
    setScanPosIndex(i)
    setScanPosTotal(t)
  }, [])
  const setLastScore = useCallback((s: number) => {
    setPersisted((p) => ({ ...p, lastScore: s }))
  }, [])
  const openDrawer = useCallback(() => setDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), [])
  const resetGuide = useCallback(() => {
    setPersisted(DEFAULTS)
    setScanPhaseState('idle')
    setScanPosIndex(0)
    setCollapsed(false)
  }, [])
  const value = useMemo<GuideContextValue>(() => {
    const prepDone = PREP_CHECKLIST.every((it) => persisted.prepChecks[it.id])
    const angleDone = persisted.selectedAngle !== null
    const scanActive = scanPhase === 'framing' || scanPhase === 'scanning' || scanPhase === 'completed'
    const doneCount = (prepDone ? 1 : 0) + (angleDone ? 1 : 0) + (scanActive ? 1 : 0) + (scanPhase === 'completed' ? 1 : 0)
    return {
      ...persisted,
      prepDone,
      angleDone,
      canStartScan: prepDone && angleDone,
      progressPercent: Math.round((doneCount / 4) * 100),
      scanPhase,
      scanPosIndex,
      scanPosTotal,
      drawerOpen,
      collapsed,
      togglePrep,
      selectAngle,
      setActiveStep,
      nextStep,
      prevStep,
      setScanPhase,
      setScanProgress,
      setLastScore,
      openDrawer,
      closeDrawer,
      toggleCollapsed,
      resetGuide,
    }
  }, [persisted, scanPhase, scanPosIndex, scanPosTotal, drawerOpen, collapsed, togglePrep, selectAngle, setActiveStep, nextStep, prevStep, setScanPhase, setScanProgress, setLastScore, openDrawer, closeDrawer, toggleCollapsed, resetGuide])
  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>
}
export function useGuide() {
  const ctx = useContext(GuideContext)
  if (!ctx) throw new Error('useGuide, <GuideProvider> icinde kullanilmalidir')
  return ctx
}
