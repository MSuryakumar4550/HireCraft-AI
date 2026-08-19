import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { TrendingUp } from 'lucide-react'

export function ProgressPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Learning Progress" 
        description="Track your journey and see how you are improving over time."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<TrendingUp className="size-12 text-muted-foreground" />}
            title="Keep going!"
            description="Your progress graph will appear here as you continue to practice."
          />
        </div>
      </div>
    </div>
  )
}
