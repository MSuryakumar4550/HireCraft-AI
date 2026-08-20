import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME } from '@/constants/theme'

export function AboutPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader title={`About ${APP_NAME}`} description="A premium frontline platform for placement preparation." />
      <Card>
        <CardHeader>
          <CardTitle>What this experience is designed for</CardTitle>
          <CardDescription>Built as a polished foundation for future AI-powered preparation modules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>{APP_NAME} brings together structured learning, resume readiness, interview practice, and progress tracking in a single premium interface.</p>
          <p>Today, the experience focuses on elegant product architecture and responsive layout. Future releases will deepen the AI and backend integrations.</p>
        </CardContent>
      </Card>
    </div>
  )
}
