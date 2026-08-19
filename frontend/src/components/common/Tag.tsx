import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TagProps {
  children: React.ReactNode
  onRemove?: () => void
  variant?: 'default' | 'outline'
  className?: string
}

export function Tag({ children, onRemove, variant = 'default', className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
        variant === 'default' && 'bg-secondary text-secondary-foreground',
        variant === 'outline' && 'border bg-background',
        className,
      )}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-sm p-0.5 hover:bg-muted"
          aria-label="Remove tag"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  )
}
