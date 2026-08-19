import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { APP_NAME } from '@/constants/theme'

interface JoyrideStep {
  target?: string
  content?: string
  placement?: string
  disableBeacon?: boolean
}

interface JoyrideContextValue {
  startTour: (steps?: JoyrideStep[]) => void
  stopTour: () => void
}

const JoyrideContext = createContext<JoyrideContextValue | null>(null)

const defaultSteps: JoyrideStep[] = [
  {
    target: 'body',
    content: `Welcome to ${APP_NAME}! Guided tours will help you navigate the platform.`,
    placement: 'center',
    disableBeacon: true,
  },
]

function JoyridePlaceholder({ steps: _steps }: { steps: JoyrideStep[] }) {
  return null
}

export function JoyrideProvider({ children }: { children: ReactNode }) {
  const [run, setRun] = useState(false)
  const [steps, setSteps] = useState<JoyrideStep[]>(defaultSteps)

  const startTour = useCallback((customSteps?: JoyrideStep[]) => {
    if (customSteps) setSteps(customSteps)
    setRun(true)
  }, [])

  const stopTour = useCallback(() => setRun(false), [])

  return (
    <JoyrideContext.Provider value={{ startTour, stopTour }}>
      {children}
      {run ? <JoyridePlaceholder steps={steps} /> : null}
    </JoyrideContext.Provider>
  )
}

export function useJoyride() {
  const context = useContext(JoyrideContext)
  if (!context) throw new Error('useJoyride must be used within JoyrideProvider')
  return context
}
