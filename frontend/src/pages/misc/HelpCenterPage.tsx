import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'

export function HelpCenterPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Help Center" description="Find product guidance and support resources in one place." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="size-4 text-primary" />
            Support resources
          </CardTitle>
          <CardDescription>Ready for future onboarding and helpdesk integrations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>• Getting started with your placement preparation workflow</p>
          <p>• Navigating interview practice and analytics</p>
          <p>• Troubleshooting account and settings issues</p>
        </CardContent>
      </Card>
    </div>
  )
}
