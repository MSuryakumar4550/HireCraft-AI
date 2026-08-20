import { CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface SuccessStateProps {
  title: string
  description?: string
}

export function SuccessState({ title, description }: SuccessStateProps) {
  return (
    <Alert className="max-w-md border-success/30 bg-success/10 text-foreground">
      <CheckCircle2 className="size-4 text-success" />
      <AlertTitle>{title}</AlertTitle>
      {description && <AlertDescription>{description}</AlertDescription>}
    </Alert>
  )
}
