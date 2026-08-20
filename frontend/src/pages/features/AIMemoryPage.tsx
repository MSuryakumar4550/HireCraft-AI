import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { BrainCircuit } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AIMemoryPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="AI Memory Engine" 
        description="Your personal knowledge base built from past mock interviews and practice sessions."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<BrainCircuit className="size-12 text-muted-foreground" />}
            title="Memory engine is empty"
            description="Complete mock interviews and practice tests to build your AI memory graph. It will identify your weak spots over time."
            action={<Button>Start a Practice Session</Button>}
          />
        </div>
      </div>
    </div>
  )
}
