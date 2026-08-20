import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { APP_NAME } from '@/constants/theme'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UploadCloud } from 'lucide-react'

interface OnboardingStepsProps {
  step: number
}

export function OnboardingSteps({ step }: OnboardingStepsProps) {
  if (step === 1) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
          <CardDescription>Let's personalize your {APP_NAME} experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="degree">Degree / Major</Label>
              <Input id="degree" placeholder="e.g. B.Tech Computer Science" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Graduation Year</Label>
              <Select>
                <SelectTrigger id="year">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2027">2027</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Short Bio (Optional)</Label>
            <Textarea id="bio" placeholder="Tell us a little about your career goals..." className="min-h-[100px]" />
          </div>
        </CardContent>
      </>
    )
  }

  if (step === 2) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl">Upload your Resume</CardTitle>
          <CardDescription>We'll analyze it to tailor your mock interviews and practice.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-6 py-10 transition-colors hover:bg-muted/40 hover:border-muted-foreground/50">
            <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
              <UploadCloud className="size-6" />
            </div>
            <h3 className="mb-1 font-medium">Click to upload or drag and drop</h3>
            <p className="text-sm text-muted-foreground">PDF, DOCX up to 5MB</p>
          </div>
        </CardContent>
      </>
    )
  }

  if (step === 3) {
    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl">Your Target Roles</CardTitle>
          <CardDescription>What kind of jobs are you preparing for?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Primary Role</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sde">Software Development Engineer</SelectItem>
                <SelectItem value="fe">Frontend Developer</SelectItem>
                <SelectItem value="be">Backend Developer</SelectItem>
                <SelectItem value="data">Data Scientist / Analyst</SelectItem>
                <SelectItem value="product">Product Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Dream Companies (Optional)</Label>
            <Input placeholder="e.g. Google, Microsoft, Amazon" />
          </div>
        </CardContent>
      </>
    )
  }

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">You're all set!</CardTitle>
        <CardDescription>Your personalized dashboard is ready.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-success/15 text-success">
          <svg className="size-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-center text-muted-foreground">
          We've customized your learning path, practice materials, and AI mentors based on your profile.
        </p>
      </CardContent>
    </>
  )
}
