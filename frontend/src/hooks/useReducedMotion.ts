import { useThemeStore } from '@/stores/themeStore'
import { useMediaQuery } from './useMediaQuery'

export function useReducedMotion(): boolean {
  const reducedMotion = useThemeStore((s) => s.reducedMotion)
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  return reducedMotion || prefersReduced
}
