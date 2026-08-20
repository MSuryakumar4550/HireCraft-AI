import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon | ReactNode
  trend?: { value: number; label: string } | 'up' | 'down' | 'neutral'
  className?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, className }: StatCardProps) {
  const normalizedTrend = typeof trend === 'string' ? trend : trend
  const isPositive = normalizedTrend === 'up' || (typeof normalizedTrend !== 'string' && (normalizedTrend?.value ?? 0) >= 0)
  const trendValue = typeof normalizedTrend === 'string' ? 0 : normalizedTrend?.value ?? 0
  const trendLabel = typeof normalizedTrend === 'string' ? '' : normalizedTrend?.label ?? ''

  return (
    <Card variant="interactive" className={cn(className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && (
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
            {typeof Icon === 'function' ? (
              <Icon className="size-4 text-primary" aria-hidden="true" />
            ) : (
              Icon
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            {isPositive ? (
              <TrendingUp className="size-3 text-success" aria-hidden="true" />
            ) : (
              <TrendingDown className="size-3 text-destructive" aria-hidden="true" />
            )}
            <span className={isPositive ? 'text-success' : 'text-destructive'}>
              {isPositive ? '+' : ''}
              {trendValue}%
            </span>
            {trendLabel && <span className="text-muted-foreground">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
