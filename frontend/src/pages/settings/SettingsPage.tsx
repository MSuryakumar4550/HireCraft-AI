import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME } from '@/constants/theme'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useThemeStore } from '@/stores/themeStore'

export function SettingsPage() {
  const { reducedMotion, density, setReducedMotion, setDensity } = useThemeStore()

  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Settings" 
        description="Manage your account settings and preferences."
      />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how {APP_NAME} looks on your device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">Disable animations and page transitions.</p>
              </div>
              <Switch
                checked={reducedMotion}
                onCheckedChange={setReducedMotion}
                aria-label="Toggle reduced motion"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Decrease spacing between UI elements.</p>
              </div>
              <Switch
                checked={density === 'compact'}
                onCheckedChange={(checked) => setDensity(checked ? 'compact' : 'comfortable')}
                aria-label="Toggle compact mode"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
