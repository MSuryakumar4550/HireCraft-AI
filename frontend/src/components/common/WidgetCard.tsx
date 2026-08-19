import type { ReactNode } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface WidgetCardProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  icon?: ReactNode
}

export function WidgetCard({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  icon,
}: WidgetCardProps) {
  return (
    <Card className={cn('h-full', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}
