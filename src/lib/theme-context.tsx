'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Theme = 'light' | 'dark'

const THEME_KEY = 'theme'

/** İlk boyamadan önce çalışan inline script — varsayılan aydınlık, tercih varsa koyu */
export const themeInitScript = `(function(){try{if(localStorage.getItem('${THEME_KEY}')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Varsayılan AYDINLIK; yalnızca kullanıcı daha önce koyu seçtiyse koyu
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_KEY)
      if (stored === 'dark') {
        setThemeState('dark')
        applyTheme('dark')
      } else {
        applyTheme('light')
      }
    } catch {
      /* yoksay */
    }
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    applyTheme(next)
    try {
      window.localStorage.setItem(THEME_KEY, next)
    } catch {
      /* yoksay */
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      try {
        window.localStorage.setItem(THEME_KEY, next)
      } catch {
        /* yoksay */
      }
      return next
    })
  }, [])

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme, <ThemeProvider> içinde kullanılmalıdır')
  return ctx
}
