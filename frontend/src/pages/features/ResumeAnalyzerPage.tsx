import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { FileText, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ResumeAnalyzerPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Resume Analyzer" 
        description="Upload your resume to get an AI-powered ATS score and actionable feedback."
      />
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <EmptyState
            icon={<FileText className="size-12 text-muted-foreground" />}
            title="No resume uploaded"
            description="Upload your latest resume in PDF format to get started with the analysis."
            action={
              <Button>
                <Upload className="mr-2 size-4" />
                Upload Resume
              </Button>
            }
          />
        </div>
      </div>
    </div>
  )
}
