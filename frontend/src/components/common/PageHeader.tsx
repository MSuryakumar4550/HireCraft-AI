import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { AppBreadcrumbs } from '@/components/layout/AppBreadcrumbs'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  showBreadcrumbs?: boolean
  className?: string
}

export function PageHeader({
  title,
  description,
  actions,
  showBreadcrumbs = true,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn('mb-6 space-y-4', className)}>
      {showBreadcrumbs && <AppBreadcrumbs />}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </header>
  )
}
