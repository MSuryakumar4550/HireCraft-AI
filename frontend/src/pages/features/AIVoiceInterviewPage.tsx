import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { 
  Mic, 
  Square, 
  Send, 
  Brain, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  Database, 
  Cpu, 
  Network, 
  Code,
  Sparkles,
  Volume2,
  Award
} from 'lucide-react'
import { toast } from 'sonner'
import { voiceInterviewService } from '@/services/voiceInterviewService'
import type { 
  InterviewSession, 
  InterviewQuestion, 
  InterviewSummaryResponse 
} from '@/services/voiceInterviewService'

interface SubjectOption {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
}

const SUBJECT_OPTIONS: SubjectOption[] = [
  {
    id: 'DBMS',
    name: 'Database Management Systems',
    description: 'ACID properties, indexing, SQL queries, normalization, and transactions.',
    icon: Database,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    id: 'OPERATING_SYSTEMS',
    name: 'Operating Systems',
    description: 'Processes, threads, deadlock handling, memory paging, and CPU scheduling.',
    icon: Cpu,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'COMPUTER_NETWORKS',
    name: 'Computer Networks',
    description: 'OSI 7-layer model, TCP 3-way handshake, UDP, DNS, and HTTP/3 QUIC.',
    icon: Network,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    id: 'OOPS_DATA_STRUCTURES',
    name: 'OOPs & Data Structures',
    description: 'Encapsulation, inheritance, polymorphism, HashMap, Trees, and Garbage Collection.',
    icon: Code,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
]

export function AIVoiceInterviewPage() {
  const [step, setStep] = useState<'setup' | 'interview' | 'summary'>('setup')
  
  // Setup selections
  const [selectedSubject, setSelectedSubject] = useState<string>('DBMS')
  const [experienceLevel, setExperienceLevel] = useState<string>('Entry Level')
  const [difficultyLevel, setDifficultyLevel] = useState<string>('MEDIUM')
  
  // Session & Question state
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState<number>(1)
  const [totalQuestions] = useState<number>(3)
  
  // Audio & Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0)
  const [textAnswer, setTextAnswer] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  
  // Summary state
  const [summary, setSummary] = useState<InterviewSummaryResponse | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Handler: Start New Interview Session
  const handleStartSession = async () => {
    setIsSubmitting(true)
    try {
      // Dummy candidate ID for current session demo
      const candidateId = '11111111-1111-1111-1111-111111111111'
      
      const newSession = await voiceInterviewService.createSession({
        candidateId,
        jobRole: selectedSubject.replace('_', ' ') + ' Technical Specialist',
        experienceLevel,
        interviewType: 'Technical',
        subject: selectedSubject,
        difficultyLevel,
        useQuestionBank: true,
      })

      const startedSession = await voiceInterviewService.startInterview(newSession.id)
      setSession(startedSession)
      
      const q = await voiceInterviewService.getCurrentQuestion(startedSession.id)
      setCurrentQuestion(q)
      setQuestionIndex(1)
      setStep('interview')
      toast.success('Interview session initialized with Groq AI engine!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to start interview session. Ensure Spring Boot backend is running on port 8080.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler: Toggle Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(200)
      setIsRecording(true)
      setRecordingSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      toast.error('Microphone access denied. You can also type your answer below.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  // Handler: Submit Answer (Voice Audio or Text)
  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion) return

    setIsSubmitting(true)
    try {
      let finalTranscript = textAnswer.trim()

      if (audioChunksRef.current.length > 0) {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        try {
          await voiceInterviewService.submitVoiceAnswer(session.id, currentQuestion.id, audioBlob)
          toast.success('Voice audio submitted and transcribed!')
        } catch {
          // Fallback text if voice transcription endpoint is in mock mode
          if (!finalTranscript) finalTranscript = "Answer recorded via audio stream."
          await voiceInterviewService.submitAnswer(session.id, currentQuestion.id, finalTranscript)
        }
      } else if (finalTranscript) {
        await voiceInterviewService.submitAnswer(session.id, currentQuestion.id, finalTranscript)
      } else {
        toast.error('Please record your voice or enter a response text before submitting.')
        setIsSubmitting(false)
        return
      }

      setTextAnswer('')
      audioChunksRef.current = []

      // Check if more questions remain
      if (questionIndex < totalQuestions) {
        const nextQ = await voiceInterviewService.getCurrentQuestion(session.id)
        setCurrentQuestion(nextQ)
        setQuestionIndex((prev) => prev + 1)
        toast.info(`Progressed to Question ${questionIndex + 1} of ${totalQuestions}`)
      } else {
        // Complete Interview
        await voiceInterviewService.completeInterview(session.id)
        const summaryData = await voiceInterviewService.getSummary(session.id)
        setSummary(summaryData)
        setStep('summary')
        toast.success('Interview complete! Groq AI evaluation summary generated.')
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
        title="AI Voice Interview"
        description="Experience an interactive technical mock interview evaluated live by Groq AI (Llama 3.3)."
      />

      {/* STEP 1: SETUP / SUBJECT SELECTION */}
      {step === 'setup' && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                <CardTitle>Select a Core Computer Science Subject</CardTitle>
              </div>
              <CardDescription>
                Choose one of the 4 core topics to load pre-seeded questions and launch adaptive Groq LLM interview probing.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {SUBJECT_OPTIONS.map((sub) => {
                const IconComponent = sub.icon
                const isSelected = selectedSubject === sub.id
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`group cursor-pointer rounded-xl border p-5 transition-all hover:border-primary ${
                      isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`grid size-10 place-items-center rounded-lg border ${sub.color}`}>
                        <IconComponent className="size-5" />
                      </span>
                      {isSelected && <CheckCircle2 className="size-5 text-primary" />}
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground group-hover:text-primary">{sub.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{sub.description}</p>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Configuration Parameters */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Experience Level</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {['Entry Level / Student', 'Mid-Level (1-3 yrs)', 'Senior (3+ yrs)'].map((level) => (
                  <Button
                    key={level}
                    variant={experienceLevel === level ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExperienceLevel(level)}
                  >
                    {level}
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Target Difficulty</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {['EASY', 'MEDIUM', 'HARD'].map((diff) => (
                  <Button
                    key={diff}
                    variant={difficultyLevel === diff ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDifficultyLevel(diff)}
                  >
                    {diff}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleStartSession} disabled={isSubmitting} className="gap-2">
              <Mic className="size-5" />
              {isSubmitting ? 'Initializing Interview...' : 'Start AI Voice Interview'}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: ACTIVE VOICE INTERVIEW */}
      {step === 'interview' && currentQuestion && (
        <div className="space-y-6">
          {/* Progress Header */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary text-primary font-medium">
                    {selectedSubject.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">{difficultyLevel}</Badge>
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Question {questionIndex} of {totalQuestions}
                </p>
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

          {/* Question Display Card */}
          <Card className="shadow-lg">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                <Brain className="size-5" /> AI Interviewer Question
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {currentQuestion.questionText}
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Microphone Recorder */}
              <div className="rounded-xl border bg-muted/30 p-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Volume2 className="size-4 text-primary" /> Speak your response aloud or type below
                </div>

                <div className="flex items-center justify-center gap-4 py-4">
                  {!isRecording ? (
                    <Button size="lg" variant="default" onClick={startRecording} className="size-16 rounded-full p-0 shadow-lg">
                      <Mic className="size-7" />
                    </Button>
                  ) : (
                    <Button size="lg" variant="destructive" onClick={stopRecording} className="size-16 rounded-full p-0 animate-pulse">
                      <Square className="size-7" />
                    </Button>
                  )}
                </div>

                {isRecording && (
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-destructive">
                    <span className="size-2 rounded-full bg-destructive animate-ping" />
                    Recording: {recordingSeconds}s
                  </div>
                )}
              </div>

              {/* Text Fallback Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Response Transcript / Text Notes:
                </label>
                <Textarea
                  placeholder="Type your technical answer here if microphone is unavailable..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Send className="size-4" />
                  {isSubmitting ? 'Evaluating with Groq LLM...' : questionIndex === totalQuestions ? 'Submit & Finalize Summary' : 'Submit & Next Question'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* STEP 3: SUMMARY & EVALUATION REPORT */}
      {step === 'summary' && summary && (
        <div className="space-y-6">
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
                  <Award className="size-6" /> Interview Evaluation Complete
                </div>
                <h2 className="text-2xl font-bold">{summary.jobRole} Session</h2>
                <p className="text-sm text-muted-foreground">{summary.summaryFeedback}</p>
              </div>
              <div className="grid place-items-center rounded-2xl bg-card border p-6 shadow-sm min-w-[140px]">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Overall Score</span>
                <span className="text-4xl font-extrabold text-emerald-500 mt-1">{summary.overallScore}</span>
                <span className="text-xs text-muted-foreground mt-1">/ 100</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-600 flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-5" /> Identified Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {summary.overallStrengths.map((str, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-500 font-bold">•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600 flex items-center gap-2 text-base">
                  <AlertCircle className="size-5" /> Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {summary.areasForImprovement.map((area, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{area}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={() => setStep('setup')} className="gap-2">
              <RotateCcw className="size-4" /> Start Another Subject Mock Interview
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
