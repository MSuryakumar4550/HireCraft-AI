import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function ProfilePage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title="Profile" description="Keep your professional profile aligned with your prep journey." />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <CardTitle>Professional Snapshot</CardTitle>
            <CardDescription>Your identity and goals for future placement opportunities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Full name</p>
              <p className="mt-1 font-medium">Aarav Sharma</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Target roles</p>
              <p className="mt-1 font-medium">Software Engineer · Frontend Engineer</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile Actions</CardTitle>
            <CardDescription>Prepare a polished profile for future platform integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full">Upload Resume</Button>
            <Button variant="outline" className="w-full">Edit Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
