import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AccentColor, Density, ThemeMode } from '@/types/theme'

interface ThemeState {
  mode: ThemeMode
  accent: AccentColor
  density: Density
  reducedMotion: boolean
  setMode: (mode: ThemeMode) => void
  setAccent: (accent: AccentColor) => void
  setDensity: (density: Density) => void
  setReducedMotion: (reduced: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      accent: 'beige',
      density: 'comfortable',
      reducedMotion: false,
      setMode: (mode) => set({ mode }),
      setAccent: (accent) => set({ accent }),
      setDensity: (density) => set({ density }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    {
      name: 'hirecraft-theme',
      version: 7,
      migrate: (persistedState) => ({
        ...(persistedState as ThemeState),
        mode: 'light',
        accent: 'beige',
      }),
    },
  ),
)
