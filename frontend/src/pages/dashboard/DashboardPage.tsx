import { PageHeader } from '@/components/common/PageHeader'
import { DashboardWidgets } from './components/DashboardWidgets'

export function DashboardPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Welcome back, Student" 
        description="Here's a summary of your placement preparation progress."
      />
      <DashboardWidgets />
    </div>
  )
}
