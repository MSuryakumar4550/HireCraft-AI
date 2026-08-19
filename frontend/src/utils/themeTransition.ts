const TRANSITION_CLASS = 'theme-transitioning'
const TRANSITION_DURATION = 220

/** Applies a brief visual crossfade around a theme state update. */
export function transitionTheme(change: () => void, reducedMotion = false) {
  if (reducedMotion || typeof document === 'undefined') {
    change()
    return
  }

  const root = document.documentElement
  root.classList.add(TRANSITION_CLASS)

  window.requestAnimationFrame(() => {
    change()
    window.setTimeout(() => root.classList.remove(TRANSITION_CLASS), TRANSITION_DURATION)
  })
}
