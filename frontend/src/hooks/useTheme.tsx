import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ReturnType<typeof useThemeStore.getState>['mode']) {
  if (mode === 'system') return getSystemTheme()
  if (mode === 'amoled') return 'amoled'
  return mode
}

export function useTheme() {
  const { mode, accent, density, reducedMotion, setMode, setAccent, setDensity, setReducedMotion } =
    useThemeStore()

  useEffect(() => {
    const root = document.documentElement
    const resolved = resolveTheme(mode)

    root.classList.remove('light', 'dark', 'amoled')
    if (resolved === 'amoled') {
      root.classList.add('dark', 'amoled')
    } else {
      root.classList.add(resolved)
    }

    root.setAttribute('data-accent', accent)
    root.setAttribute('data-density', density)
    root.setAttribute('data-reduced-motion', reducedMotion ? 'true' : 'false')
  }, [mode, accent, density, reducedMotion])

  useEffect(() => {
    if (mode !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const root = document.documentElement
      const resolved = getSystemTheme()
      root.classList.remove('light', 'dark', 'amoled')
      root.classList.add(resolved)
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [mode])

  return {
    mode,
    accent,
    density,
    reducedMotion,
    setMode,
    setAccent,
    setDensity,
    setReducedMotion,
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme()
  return <>{children}</>
}
