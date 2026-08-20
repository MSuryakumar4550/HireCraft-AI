import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

const sizes = { sm: 'size-4', md: 'size-6', lg: 'size-8' }

export function LoadingSpinner({ size = 'md', className, label = 'Loading' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center justify-center', className)} role="status" aria-label={label}>
      <Loader2 className={cn('animate-spin text-primary', sizes[size])} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
