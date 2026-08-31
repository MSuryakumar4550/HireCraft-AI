import { useState, useRef, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { FileText, Upload, AlertCircle, Loader2, CheckCircle2, ChevronRight, Briefcase, XCircle, Search, Bot, BrainCircuit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { atsService, type PythonAtsResponse } from '@/services/atsService'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ResumeAnalyzerPage() {
  const user = useAuthStore((state) => state.user)
  
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [requiredSkills, setRequiredSkills] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<PythonAtsResponse | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const loadingMessages = [
    { text: "Scanning document...", icon: <FileText className="size-4 mr-2 text-indigo-400 animate-pulse" /> },
    { text: "Extracting text...", icon: <FileText className="size-4 mr-2 text-indigo-400" /> },
    { text: "Waking up AI model...", icon: <Bot className="size-4 mr-2 text-indigo-400 animate-bounce" /> },
    { text: "Parsing skills & experience...", icon: <BrainCircuit className="size-4 mr-2 text-indigo-400 animate-pulse" /> },
    { text: "Cross-referencing JD...", icon: <Search className="size-4 mr-2 text-indigo-400 animate-pulse" /> },
    { text: "Analyzing semantic context...", icon: <BrainCircuit className="size-4 mr-2 text-indigo-400" /> },
    { text: "Computing ATS Score...", icon: <Search className="size-4 mr-2 text-indigo-400 animate-pulse" /> },
    { text: "Generating actionable feedback...", icon: <Bot className="size-4 mr-2 text-indigo-400 animate-bounce" /> },
    { text: "Finalizing insights...", icon: <CheckCircle2 className="size-4 mr-2 text-emerald-400 animate-pulse" /> },
  ]

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isUploading) {
      setLoadingStep(0)
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingMessages.length)
      }, 800) // Super fast interval (800ms) and loops infinitely
    }
    return () => clearInterval(interval)
  }, [isUploading])

  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [analysisResult])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
      setAnalysisResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a resume file first.')
      return
    }
    if (!user?.id) {
      setError('You must be logged in to analyze your resume.')
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      setAnalysisResult(null)
      
      const response = await atsService.analyzeResume(
        file, 
        jobDescription, 
        requiredSkills, 
        user.id
      )
      
      setAnalysisResult(response.data)
      toast.success('Resume analyzed successfully!')
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.')
      toast.error('Failed to analyze resume')
    } finally {
      setIsUploading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500"
    if (score >= 60) return "text-amber-500"
    return "text-rose-500"
  }

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500"
    if (score >= 60) return "bg-amber-500"
    return "bg-rose-500"
  }

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      <PageHeader 
        title="Resume Analyzer" 
        description="Upload your resume to get an AI-powered ATS score and actionable feedback."
      />
      
      <Card className="shadow-sm border-muted">
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>Select your resume and define the target job description and skills.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="resume-upload" className="font-semibold">Resume (PDF, DOC, DOCX)</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button 
                variant={file ? "secondary" : "default"}
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full sm:w-auto"
              >
                <Upload className="mr-2 size-4" />
                {file ? 'Change File' : 'Select File'}
              </Button>
              <div className="flex items-center text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-md border w-full sm:w-auto overflow-hidden">
                <FileText className="size-4 mr-2 shrink-0" />
                <span className="truncate">{file ? file.name : 'No file selected'}</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                id="resume-upload"
                accept="application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label htmlFor="job-description" className="font-semibold">Target Job Description</Label>
            <Textarea
              id="job-description"
              placeholder="Paste the job description here..."
              className="min-h-[120px] resize-y"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label htmlFor="required-skills" className="font-semibold">Required Skills (Comma separated)</Label>
            <Input
              id="required-skills"
              placeholder="e.g. Python, React, AWS, Node.js"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="pt-6 flex justify-center border-t mt-4">
            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading} 
              size="lg" 
              className={`w-full sm:w-auto relative overflow-hidden group min-w-[320px] transition-all duration-500 ${isUploading ? 'bg-white hover:bg-white text-indigo-900 border border-indigo-100 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-[1.02]' : ''}`}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
              {isUploading ? (
                <div className="flex items-center justify-center w-full">
                  <Loader2 className="mr-3 size-5 animate-spin text-indigo-500 shrink-0" />
                  <span 
                    key={loadingStep}
                    className="flex items-center text-sm font-semibold text-indigo-900 animate-in zoom-in-95 fade-in slide-in-from-bottom-2 duration-300"
                  >
                    {loadingMessages[loadingStep].icon}
                    {loadingMessages[loadingStep].text}
                  </span>
                </div>
              ) : (
                'Upload and Analyze'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Dashboard */}
      {analysisResult && analysisResult.final_ats_score != null && (
        <div ref={resultsRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-4">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Main Score Card */}
            <Card className="col-span-1 md:col-span-1 shadow-sm border-muted flex flex-col justify-center items-center p-6 bg-gradient-to-br from-background to-muted/20">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">Final ATS Score</h3>
              <div className="relative flex items-center justify-center mb-4 mt-2">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-muted/30" />
                  <circle 
                    cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="12" 
                    strokeDasharray={440} 
                    strokeDashoffset={440 - (440 * analysisResult.final_ats_score) / 100}
                    className={`transition-all duration-1000 ease-out ${getProgressColor(analysisResult.final_ats_score).replace('bg-', 'text-')}`} 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-5xl font-bold tracking-tighter ${getScoreColor(analysisResult.final_ats_score)}`}>
                    {Math.round(analysisResult.final_ats_score)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">/ 100</span>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground font-medium">
                {analysisResult.final_ats_score >= 80 ? 'Excellent Match!' : analysisResult.final_ats_score >= 60 ? 'Good Potential' : 'Needs Improvement'}
              </p>
            </Card>

            {/* AI Feedback & Suggestions */}
            <Card className="col-span-1 md:col-span-2 shadow-sm border-muted">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-indigo-500" /> 
                  Actionable AI Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                  {analysisResult.breakdown?.recommendations?.length > 0 ? (
                    analysisResult.breakdown.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 items-start bg-indigo-50/50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                        <div className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-sm font-bold mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-sm leading-relaxed">{rec}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-4 text-center">No specific recommendations generated.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            
            {/* Scoring Breakdown */}
            <Card className="shadow-sm border-muted">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Scoring Breakdown</CardTitle>
                <CardDescription>How your resume performed across key metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { label: "Keyword Match", score: Math.round(analysisResult.breakdown?.keyword_match?.score * 100) || 0 },
                  { label: "Semantic Score", score: Math.round(analysisResult.breakdown?.semantic_score * 100) || 0 },
                  { label: "Format Score", score: Math.round(analysisResult.breakdown?.format_score * 100) || 0 },
                ].map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-foreground/80">{item.label}</span>
                      <span className={`font-bold ${getScoreColor(item.score)}`}>{item.score}/100</span>
                    </div>
                    <Progress value={item.score} className={`h-2 ${getProgressColor(item.score).replace('bg-', '[&>div]:bg-')}`} />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Keyword Analysis */}
            <Card className="shadow-sm border-muted">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Keyword Analysis</CardTitle>
                <CardDescription>Target skills found vs missing</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-6">
                  
                  {/* Matched Skills */}
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center text-foreground/80">
                      <Badge variant="outline" className="mr-2 border-indigo-200 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300">
                        {analysisResult.breakdown?.keyword_match?.matched?.length || 0}
                      </Badge>
                      Matched Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                      {analysisResult.breakdown?.keyword_match?.matched?.length ? (
                        analysisResult.breakdown.keyword_match.matched.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="font-normal bg-secondary/50 hover:bg-secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No matching skills detected.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-3 flex items-center text-foreground/80">
                      <Badge variant="outline" className="mr-2 border-rose-200 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-300">
                        {analysisResult.breakdown?.keyword_match?.missing?.length || 0}
                      </Badge>
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.breakdown?.keyword_match?.missing?.length ? (
                        analysisResult.breakdown.keyword_match.missing.map((skill, i) => (
                          <Badge key={i} variant="destructive" className="font-normal bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/50 dark:text-rose-300">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="size-4" /> You have all required keywords!
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      )}
    </div>
  )
}
