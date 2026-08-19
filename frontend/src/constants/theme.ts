import type { AccentColor, Density, ThemeMode } from '@/types/theme'

export const THEME_MODES: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
  { value: 'amoled', label: 'AMOLED Dark' },
]

export const ACCENT_COLORS: { value: AccentColor; label: string; className: string }[] = [
  { value: 'beige', label: 'Warm Beige', className: 'bg-[#b28c76]' },
]

export const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
]

export const APP_NAME = 'HireCraft AI'
export const APP_TAGLINE = 'Crafting Careers. Building Confidence.'
