import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function StudyPlannerPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Study Planner" 
        description="Your personalized timeline to prepare for the placement season."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<CalendarDays className="size-12 text-muted-foreground" />}
            title="Generate your study plan"
            description="Input your placement dates and we'll generate a day-by-day preparation schedule."
            action={<Button>Create Study Plan</Button>}
          />
        </div>
      </div>
    </div>
  )
}
