import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ReportsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Performance Reports" 
        description="Detailed analytics of your mock interviews and practice tests."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<BarChart3 className="size-12 text-muted-foreground" />}
            title="No reports generated yet"
            description="Complete at least one mock interview or practice test to generate a detailed performance report."
            action={<Button>View Sample Report</Button>}
          />
        </div>
      </div>
    </div>
  )
}
