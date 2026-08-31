import { PageHeader } from '@/components/common/PageHeader'
import { DashboardWidgets } from './components/DashboardWidgets'

import { useAuthStore } from '@/stores/useAuthStore'

export function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title={`Welcome back, ${user?.firstName || 'Student'}`} 
        description="Here's a summary of your placement preparation progress."
      />
      <DashboardWidgets />
    </div>
  )
}
