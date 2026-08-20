import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Code2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CodingPracticePage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Coding Practice" 
        description="Solve curated Data Structures and Algorithms questions."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<Code2 className="size-12 text-muted-foreground" />}
            title="Ready to code?"
            description="Select a topic or take a randomized assessment to begin."
            action={<Button>View Problem List</Button>}
          />
        </div>
      </div>
    </div>
  )
}
