import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AptitudePage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Aptitude Preparation" 
        description="Practice quantitative, logical reasoning, and verbal ability questions."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<Calculator className="size-12 text-muted-foreground" />}
            title="Master Aptitude Tests"
            description="Companies use these to screen candidates. Start practicing now."
            action={<Button>Start Aptitude Test</Button>}
          />
        </div>
      </div>
    </div>
  )
}
