import React from 'react'
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
                <SelectContent position="popper" className="max-h-[250px] overflow-y-auto">
                  {Array.from({ length: 26 }, (_, i) => 2010 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
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
    const [isDragging, setIsDragging] = React.useState(false)
    const [uploadStatus, setUploadStatus] = React.useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const handleUpload = async (file: File) => {
      setSelectedFile(file)
      setUploadStatus('uploading')
      try {
        const { apiClient } = await import('@/services/apiClient')
        await apiClient.uploadFile('/api/resume/upload', file, 'file')
        setUploadStatus('success')
        const { toast } = await import('sonner')
        toast.success('Resume uploaded successfully!')
      } catch (error: any) {
        setUploadStatus('error')
        const { toast } = await import('sonner')
        toast.error(error.message || 'Failed to upload resume')
      }
    }

    const onDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleUpload(e.dataTransfer.files[0])
      }
    }

    return (
      <>
        <CardHeader>
          <CardTitle className="text-2xl">Upload your Resume</CardTitle>
          <CardDescription>We'll analyze it to tailor your mock interviews and practice.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors
              ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 bg-muted/20 hover:bg-muted/40 hover:border-muted-foreground/50'}
              ${uploadStatus === 'success' ? 'border-success bg-success/5' : ''}
            `}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUpload(e.target.files[0])
                }
              }}
            />
            {uploadStatus === 'idle' && (
              <>
                <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">
                  <UploadCloud className="size-6" />
                </div>
                <h3 className="mb-1 font-medium">Click to upload or drag and drop</h3>
                <p className="text-sm text-muted-foreground">PDF, DOCX up to 5MB</p>
              </>
            )}
            {uploadStatus === 'uploading' && (
              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary animate-pulse">
                  <UploadCloud className="size-6 animate-bounce" />
                </div>
                <h3 className="mb-1 font-medium">Uploading {selectedFile?.name}...</h3>
                <p className="text-sm text-muted-foreground">Please wait while we process your resume.</p>
              </div>
            )}
            {uploadStatus === 'success' && (
              <div className="flex flex-col items-center text-success">
                <div className="mb-4 rounded-full bg-success/15 p-3">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-1 font-medium text-foreground">{selectedFile?.name}</h3>
                <p className="text-sm text-success">Upload complete!</p>
              </div>
            )}
            {uploadStatus === 'error' && (
              <div className="flex flex-col items-center text-destructive">
                <div className="mb-4 rounded-full bg-destructive/15 p-3">
                  <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="mb-1 font-medium text-foreground">Upload failed</h3>
                <p className="text-sm text-destructive">Click to try again</p>
              </div>
            )}
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
