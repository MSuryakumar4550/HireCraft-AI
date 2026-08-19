import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Trophy } from 'lucide-react'

export function AchievementsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Achievements" 
        description="Earn badges and points for consistently practicing and improving your skills."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<Trophy className="size-12 text-muted-foreground" />}
            title="No achievements yet"
            description="Start practicing to unlock your first achievement."
          />
        </div>
      </div>
    </div>
  )
}
