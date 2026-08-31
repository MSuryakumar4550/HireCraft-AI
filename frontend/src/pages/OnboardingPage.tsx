import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ROUTES } from '@/constants/routes'
import { BRAND_ICON } from '@/constants/navigation'
import { APP_NAME } from '@/constants/theme'
import { OnboardingSteps } from './onboarding/components/OnboardingSteps'

export function OnboardingPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 4
  const navigate = useNavigate()
  const Icon = BRAND_ICON

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      navigate(ROUTES.DASHBOARD)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <header className="flex h-16 shrink-0 items-center border-b bg-background px-6">
        <div className="flex items-center gap-2">
          <Icon className="size-14" />
          <span className="font-semibold text-lg">{APP_NAME}</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-sm font-medium text-muted-foreground">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}% Complete</span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </div>

          <Card className="border shadow-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <OnboardingSteps step={step} />
              </motion.div>
            </AnimatePresence>
            
            <CardFooter className="flex justify-between border-t p-6">
              <Button variant="outline" onClick={handleBack} disabled={step === 1}>
                Back
              </Button>
              <Button onClick={handleNext}>
                {step === totalSteps ? 'Complete Setup' : 'Continue'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
