import type { ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'

interface ChartContainerProps {
  children: ReactNode
  height?: number
  className?: string
}

export function ChartContainer({ children, height = 300, className }: ChartContainerProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  )
}
