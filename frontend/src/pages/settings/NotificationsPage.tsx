import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export function NotificationsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Notifications" description="Stay on top of reminders, nudges, and opportunity updates." />
      <Card>
        <CardHeader>
          <CardTitle>Upcoming updates</CardTitle>
          <CardDescription>Notification center placeholders for future inbox-driven workflows.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
            <Bell className="mt-0.5 size-4 text-primary" />
            <div>
              <p className="font-medium">Mock interview reminder</p>
              <p className="text-sm text-muted-foreground">Your next technical practice session is scheduled for tomorrow morning.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
