import { cn } from '@/lib/utils'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  time?: string
  status?: 'completed' | 'current' | 'upcoming'
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className }: TimelineProps) {
  if (items.length === 0) return null

  return (
    <div className={cn('space-y-0', className)} role="list">
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-8 last:pb-0" role="listitem">
          {index < items.length - 1 && (
            <div className="absolute left-[11px] top-6 h-full w-px bg-border" aria-hidden="true" />
          )}
          <div
            className={cn(
              'relative z-10 mt-1 size-[22px] shrink-0 rounded-full border-2 bg-background',
              item.status === 'completed' && 'border-primary bg-primary',
              item.status === 'current' && 'border-primary',
              item.status === 'upcoming' && 'border-muted-foreground/30',
            )}
            aria-hidden="true"
          />
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{item.title}</p>
              {item.time && <span className="text-xs text-muted-foreground">{item.time}</span>}
            </div>
            {item.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
