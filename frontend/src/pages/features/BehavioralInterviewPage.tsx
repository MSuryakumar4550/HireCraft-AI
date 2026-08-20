import { useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Brain, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Target, 
  Flame, 
  HeartHandshake, 
  Lightbulb,
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

interface BehavioralCategory {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
}

const BEHAVIORAL_CATEGORIES: BehavioralCategory[] = [
  {
    id: 'LEADERSHIP_INITIATIVE',
    name: 'Leadership & Initiative',
    description: 'Demonstrating ownership, driving project outcomes, and mentoring teammates.',
    icon: Flame,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
  {
    id: 'TEAMWORK_CONFLICT',
    name: 'Teamwork & Conflict Resolution',
    description: 'Navigating disagreements, cross-functional collaboration, and constructive feedback.',
    icon: HeartHandshake,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    id: 'PROBLEM_SOLVING_ADAPTABILITY',
    name: 'Problem Solving & Adaptability',
    description: 'Handling tight deadlines, changing project scope, and unblocking critical failures.',
    icon: Lightbulb,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 'GOAL_ACHIEVEMENT',
    name: 'Goal Achievement & Impact',
    description: 'Overcoming setbacks, measuring project success, and delivering key metrics.',
    icon: Target,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
]

export function BehavioralInterviewPage() {
  const [step, setStep] = useState<'setup' | 'interview' | 'summary'>('setup')
  const [selectedCategory, setSelectedCategory] = useState<string>('LEADERSHIP_INITIATIVE')
  const [experienceLevel, setExperienceLevel] = useState<string>('Mid-Level (1-3 yrs)')
  
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
      const catObj = BEHAVIORAL_CATEGORIES.find((c) => c.id === selectedCategory)
      
      const newSession = await voiceInterviewService.createSession({
        candidateId,
        jobRole: (catObj?.name || 'Behavioral HR') + ' Specialist',
        experienceLevel,
        interviewType: 'Behavioral',
        subject: selectedCategory,
        difficultyLevel: 'MEDIUM',
        useQuestionBank: true,
      })

      const startedSession = await voiceInterviewService.startInterview(newSession.id)
      setSession(startedSession)
      
      const q = await voiceInterviewService.getCurrentQuestion(startedSession.id)
      setCurrentQuestion(q)
      setQuestionIndex(1)
      setStep('interview')
      toast.success('Behavioral Mock Session initialized with STAR method feedback!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize session. Ensure Spring Boot backend is running.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion) return

    if (!textAnswer.trim()) {
      toast.error('Please type your STAR method response before submitting.')
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
        toast.success('Behavioral session complete! View your Groq STAR method analysis.')
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
        title="Behavioral Interview"
        description="Master HR & Situational interview questions using the structured STAR Method (Situation, Task, Action, Result)."
      />

      {/* STAR Framework Banner */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardContent className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="size-5 text-amber-500" />
            <div>
              <p className="font-semibold text-sm">Use the STAR Method for Maximum Impact</p>
              <p className="text-xs text-muted-foreground">Structuring your responses with Situation ➔ Task ➔ Action ➔ Result yields higher evaluation scores.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10">S - Situation</Badge>
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10">T - Task</Badge>
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10">A - Action</Badge>
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-500/10">R - Result</Badge>
          </div>
        </CardContent>
      </Card>

      {/* SETUP STEP */}
      {step === 'setup' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <CardTitle>Select Behavioral Competency Track</CardTitle>
              </div>
              <CardDescription>
                Choose a behavioral category to generate realistic situational HR scenario questions.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {BEHAVIORAL_CATEGORIES.map((cat) => {
                const IconComponent = cat.icon
                const isSelected = selectedCategory === cat.id
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`group cursor-pointer rounded-xl border p-5 transition-all hover:border-primary ${
                      isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`grid size-10 place-items-center rounded-lg border ${cat.color}`}>
                        <IconComponent className="size-5" />
                      </span>
                      {isSelected && <CheckCircle2 className="size-5 text-primary" />}
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">{cat.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{cat.description}</p>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Experience Level Context</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              {['Entry Level / Student', 'Mid-Level (1-3 yrs)', 'Senior / Lead'].map((lvl) => (
                <Button key={lvl} variant={experienceLevel === lvl ? 'default' : 'outline'} size="sm" onClick={() => setExperienceLevel(lvl)}>
                  {lvl}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleStartSession} disabled={isSubmitting} className="gap-2">
              <Sparkles className="size-5" />
              {isSubmitting ? 'Starting Session...' : 'Start Behavioral Practice Session'}
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
                    {selectedCategory.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">Behavioral HR</Badge>
                </div>
                <p className="text-sm font-medium text-muted-foreground">Scenario Question {questionIndex} of {totalQuestions}</p>
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
                <Brain className="size-5" /> HR Interviewer Scenario Question
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {currentQuestion.questionText}
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Your STAR Response (Situation ➔ Task ➔ Action ➔ Result):</label>
                <Textarea
                  placeholder="Situation: Describe the context...\nTask: What was your objective?\nAction: What specific steps did you take?\nResult: What was the outcome and key metric?"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={6}
                  className="resize-none text-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button size="lg" onClick={handleSubmitAnswer} disabled={isSubmitting} className="gap-2">
                  <Send className="size-4" />
                  {isSubmitting ? 'Evaluating with Groq LLM...' : questionIndex === totalQuestions ? 'Submit & View Report' : 'Submit & Next Scenario'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* SUMMARY REPORT */}
      {step === 'summary' && summary && (
        <div className="space-y-6">
          <Card className="border-rose-500/30 bg-rose-500/5">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-lg">
                  <Award className="size-6" /> Behavioral Session STAR Report
                </div>
                <h2 className="text-2xl font-bold">{summary.jobRole}</h2>
                <p className="text-sm text-muted-foreground">{summary.summaryFeedback}</p>
              </div>
              <div className="grid place-items-center rounded-2xl bg-card border p-6 shadow-sm min-w-[140px]">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Communication Score</span>
                <span className="text-4xl font-extrabold text-rose-500 mt-1">{summary.overallScore}</span>
                <span className="text-xs text-muted-foreground mt-1">/ 100</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-emerald-600 flex items-center gap-2 text-base"><CheckCircle2 className="size-5" /> Demonstrated Behavioral Strengths</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {summary.overallStrengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm"><span className="text-emerald-500 font-bold">•</span><span>{str}</span></div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-amber-600 flex items-center gap-2 text-base"><AlertCircle className="size-5" /> Behavioral Guidance & STAR Feedback</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {summary.areasForImprovement.map((area, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm"><span className="text-amber-500 font-bold">•</span><span>{area}</span></div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={() => setStep('setup')} className="gap-2">
              <RotateCcw className="size-4" /> Start Another Behavioral Mock Session
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
