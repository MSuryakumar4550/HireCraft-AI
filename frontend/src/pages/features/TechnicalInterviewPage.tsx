import { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Laptop, 
  Brain, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Server, 
  ShieldCheck, 
  Layers,
  Terminal,
  Sparkles,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { voiceInterviewService } from '@/services/voiceInterviewService'
import type { 
  InterviewSession, 
  InterviewQuestion, 
  InterviewSummaryResponse 
} from '@/services/voiceInterviewService'

interface TechDomain {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
}

const TECH_DOMAINS: TechDomain[] = [
  {
    id: 'SYSTEM_DESIGN',
    name: 'System Design & Architecture',
    description: 'Scalability, microservices, load balancing, caching strategies, and database sharding.',
    icon: Server,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  {
    id: 'BACKEND_DEVELOPMENT',
    name: 'Java & Backend Engineering',
    description: 'Spring Boot REST APIs, multithreading, concurrency, memory management, and JPA.',
    icon: Terminal,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'DEVOPS_CLOUD',
    name: 'Cloud & Infrastructure',
    description: 'Docker containers, Kubernetes orchestration, CI/CD pipelines, AWS/GCP services.',
    icon: Layers,
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  },
  {
    id: 'SECURITY_APIS',
    name: 'API Security & Design',
    description: 'OAuth2/JWT authentication, rate limiting, encryption, OWASP top 10 security.',
    icon: ShieldCheck,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
]

export function TechnicalInterviewPage() {
  const [step, setStep] = useState<'setup' | 'interview' | 'summary'>('setup')
  const [selectedDomain, setSelectedDomain] = useState<string>('SYSTEM_DESIGN')
  const [experienceLevel, setExperienceLevel] = useState<string>('Mid-Level (1-3 yrs)')
  const [difficultyLevel, setDifficultyLevel] = useState<string>('MEDIUM')
  
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState<number>(1)
  const [totalQuestions] = useState<number>(3)
  
  const [textAnswer, setTextAnswer] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [summary, setSummary] = useState<InterviewSummaryResponse | null>(null)

  const handleStartSession = async () => {
    setIsSubmitting(true)
    try {
      const candidateId = '11111111-1111-1111-1111-111111111111'
      const domainObj = TECH_DOMAINS.find((d) => d.id === selectedDomain)
      
      const newSession = await voiceInterviewService.createSession({
        candidateId,
        jobRole: (domainObj?.name || 'Technical') + ' Specialist',
        experienceLevel,
        interviewType: 'Technical',
        subject: selectedDomain,
        difficultyLevel,
        useQuestionBank: true,
      })

      const startedSession = await voiceInterviewService.startInterview(newSession.id)
      setSession(startedSession)
      
      const q = await voiceInterviewService.getCurrentQuestion(startedSession.id)
      setCurrentQuestion(q)
      setQuestionIndex(1)
      setStep('interview')
      toast.success('Technical Mock Interview initialized!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize session. Ensure Spring Boot backend is running.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion) return

    if (!textAnswer.trim()) {
      toast.error('Please type your technical response before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      await voiceInterviewService.submitAnswer(session.id, currentQuestion.id, textAnswer.trim())
      setTextAnswer('')

      if (questionIndex < totalQuestions) {
        const nextQ = await voiceInterviewService.getCurrentQuestion(session.id)
        setCurrentQuestion(nextQ)
        setQuestionIndex((prev) => prev + 1)
        toast.info(`Next Question: ${questionIndex + 1} of ${totalQuestions}`)
      } else {
        await voiceInterviewService.completeInterview(session.id)
        const summaryData = await voiceInterviewService.getSummary(session.id)
        setSummary(summaryData)
        setStep('summary')
        toast.success('Technical session completed! View your Groq AI score summary below.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error submitting answer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Technical Interview"
        description="Master deep technical concepts, System Design, and Architecture with real-time Groq AI feedback."
      />

      {/* SETUP STEP */}
      {step === 'setup' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Laptop className="size-5 text-primary" />
                <CardTitle>Select Technical Domain</CardTitle>
              </div>
              <CardDescription>
                Choose a specialized engineering track to generate focused technical interview questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TECH_DOMAINS.map((domain) => {
                const IconComponent = domain.icon
                const isSelected = selectedDomain === domain.id
                return (
                  <div
                    key={domain.id}
                    onClick={() => setSelectedDomain(domain.id)}
                    className={`group cursor-pointer rounded-xl border p-5 transition-all hover:border-primary ${
                      isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`grid size-10 place-items-center rounded-lg border ${domain.color}`}>
                        <IconComponent className="size-5" />
                      </span>
                      {isSelected && <CheckCircle2 className="size-5 text-primary" />}
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">{domain.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{domain.description}</p>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">Target Experience Level</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {['Entry Level / Student', 'Mid-Level (1-3 yrs)', 'Senior (3+ yrs)'].map((lvl) => (
                  <Button key={lvl} variant={experienceLevel === lvl ? 'default' : 'outline'} size="sm" onClick={() => setExperienceLevel(lvl)}>
                    {lvl}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Challenge Difficulty</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                  <Button key={diff} variant={difficultyLevel === diff ? 'default' : 'outline'} size="sm" onClick={() => setDifficultyLevel(diff)}>
                    {diff}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleStartSession} disabled={isSubmitting} className="gap-2">
              <Sparkles className="size-5" />
              {isSubmitting ? 'Starting Session...' : 'Start Technical Mock Session'}
            </Button>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW STEP */}
      {step === 'interview' && currentQuestion && (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary text-primary font-medium">
                    {selectedDomain.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">{difficultyLevel}</Badge>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Technical Question {questionIndex} of {totalQuestions}</p>
              </div>
              <div className="w-full sm:w-48 space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Session Progress</span>
                  <span>{Math.round((questionIndex / totalQuestions) * 100)}%</span>
                </div>
                <Progress value={(questionIndex / totalQuestions) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <Brain className="size-5" /> Technical Interviewer Question
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {currentQuestion.questionText}
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Your Technical Solution / Explanation:</label>
                <Textarea
                  placeholder="Provide your technical answer, trade-offs, and architecture design details..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={6}
                  className="resize-none font-mono text-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button size="lg" onClick={handleSubmitAnswer} disabled={isSubmitting} className="gap-2">
                  <Send className="size-4" />
                  {isSubmitting ? 'Evaluating with Groq LLM...' : questionIndex === totalQuestions ? 'Submit & View Report' : 'Submit & Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUMMARY REPORT */}
      {step === 'summary' && summary && (
        <div className="space-y-6">
          <Card className="border-indigo-500/30 bg-indigo-500/5">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-lg">
                  <Award className="size-6" /> Technical Session Evaluation Report
                </div>
                <h2 className="text-2xl font-bold">{summary.jobRole}</h2>
                <p className="text-sm text-muted-foreground">{summary.summaryFeedback}</p>
              </div>
              <div className="grid place-items-center rounded-2xl bg-card border p-6 shadow-sm min-w-[140px]">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Technical Score</span>
                <span className="text-4xl font-extrabold text-indigo-500 mt-1">{summary.overallScore}</span>
                <span className="text-xs text-muted-foreground mt-1">/ 100</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-emerald-600 flex items-center gap-2 text-base"><CheckCircle2 className="size-5" /> Technical Strengths</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {summary.overallStrengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm"><span className="text-emerald-500 font-bold">•</span><span>{str}</span></div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-amber-600 flex items-center gap-2 text-base"><AlertCircle className="size-5" /> Recommended Improvements</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {summary.areasForImprovement.map((area, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm"><span className="text-amber-500 font-bold">•</span><span>{area}</span></div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={() => setStep('setup')} className="gap-2">
              <RotateCcw className="size-4" /> Start Another Technical Mock Session
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
