import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CompanyReadinessPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Company Readiness" 
        description="See how your current skills match up against the requirements of top tech companies."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<Target className="size-12 text-muted-foreground" />}
            title="Analyze your readiness"
            description="Select your dream companies to see a gap analysis of your current skills vs their typical requirements."
            action={<Button>Select Dream Companies</Button>}
          />
        </div>
      </div>
    </div>
  )
}
