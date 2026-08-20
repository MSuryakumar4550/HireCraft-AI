export type ThemeMode = 'light' | 'dark' | 'system' | 'amoled'
export type AccentColor = 'beige'
export type Density = 'comfortable' | 'compact'

export interface ThemeSettings {
  mode: ThemeMode
  accent: AccentColor
  density: Density
  reducedMotion: boolean
}
