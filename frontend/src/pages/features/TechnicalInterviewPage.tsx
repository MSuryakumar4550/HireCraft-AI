import { useState, useEffect, useRef } from 'react'
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
  Award,
  Mic,
  Square,
  Volume2,
  VolumeX,
  Radio
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

  // Voice & Audio Capabilities (TTS & STT)
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }
    }
  }, [])

  // Text-To-Speech (AI Interviewer Voice)
  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window) || !text) return
    
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) 
      || voices.find(v => v.lang.startsWith('en'))
    if (preferredVoice) utterance.voice = preferredVoice

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  // Speech-To-Text (Microphone Recording)
  const startRecording = async () => {
    stopSpeaking()
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          let accumulated = ''
          for (let i = 0; i < event.results.length; ++i) {
            accumulated += event.results[i][0].transcript + ' '
          }
          setTextAnswer(accumulated.trim())
        }

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error)
        }

        recognition.start()
        recognitionRef.current = recognition
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(200)

      setIsRecording(true)
      setRecordingSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)

      toast.info('Microphone recording started. Speak your technical answer clearly.')
    } catch (err) {
      toast.error('Microphone access denied or unsupported. You can type your answer in the box below.')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

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

      const startedSession = await voiceInterviewService.startInterview(newSession.id!)
      setSession(startedSession)
      
      const q = await voiceInterviewService.getCurrentQuestion(startedSession.id!)
      setCurrentQuestion(q)
      setQuestionIndex(1)
      setStep('interview')
      
      if (voiceEnabled && q?.questionText) {
        setTimeout(() => speakQuestion(q.questionText || ''), 400)
      }

      toast.success('Technical Mock Interview initialized! Voice & Text inputs active.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize session. Ensure Spring Boot backend is running.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion) return

    stopSpeaking()
    stopRecording()

    if (!textAnswer.trim()) {
      toast.error('Please speak or type your technical response before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      const nextQ = await voiceInterviewService.submitAnswer(session.id!, {
        questionNo: questionIndex,
        questionId: currentQuestion.id,
        answerText: textAnswer.trim(),
        transcript: textAnswer.trim(),
        responseDurationSeconds: recordingSeconds || 60,
      })
      setTextAnswer('')
      setRecordingSeconds(0)

      if (nextQ && questionIndex < totalQuestions) {
        setCurrentQuestion(nextQ)
        setQuestionIndex((prev) => prev + 1)
        if (voiceEnabled && nextQ.questionText) {
          setTimeout(() => speakQuestion(nextQ.questionText || ''), 400)
        }
        toast.info(`Next Question: ${questionIndex + 1} of ${totalQuestions}`)
      } else {
        await voiceInterviewService.completeInterview(session.id!)
        const summaryData = await voiceInterviewService.getSummary(session.id!)
        setSummary(summaryData)
        setStep('summary')
        toast.success('Technical session completed! View your evaluation summary below.')
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
        description="Master deep technical concepts, System Design, and Architecture with real-time AI Voice & Groq LLM feedback."
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
                Choose a specialized engineering track to generate focused technical interview questions with live Voice AI support.
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

          <div className="grid gap-6 md:grid-cols-3">
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

            <Card>
              <CardHeader><CardTitle className="text-base">Voice Capabilities</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="size-4 text-primary" />
                    <span className="text-sm font-medium">AI Voice Reader</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant={voiceEnabled ? 'default' : 'outline'} 
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                  >
                    {voiceEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  The AI interviewer reads questions aloud and transcribes your microphone input in real time.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleStartSession} disabled={isSubmitting} className="gap-2">
              <Sparkles className="size-5" />
              {isSubmitting ? 'Starting Session...' : 'Start Technical Voice Session'}
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
                  {isSpeaking && (
                    <Badge variant="default" className="animate-pulse bg-indigo-500 text-white gap-1.5 text-xs">
                      <Radio className="size-3 animate-spin" /> AI Speaking...
                    </Badge>
                  )}
                  {isRecording && (
                    <Badge variant="destructive" className="animate-pulse gap-1.5 text-xs">
                      <Radio className="size-3" /> Recording ({formatTimer(recordingSeconds)})
                    </Badge>
                  )}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  <Brain className="size-5" /> Technical Interviewer Question
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => isSpeaking ? stopSpeaking() : speakQuestion(currentQuestion.questionText || '')}
                    className="gap-2 text-xs"
                  >
                    {isSpeaking ? <VolumeX className="size-4 text-rose-500" /> : <Volume2 className="size-4 text-primary" />}
                    {isSpeaking ? 'Mute Question' : 'Listen Aloud'}
                  </Button>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {currentQuestion.questionText}
              </h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Voice Recording Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <Button
                    size="default"
                    variant={isRecording ? 'destructive' : 'default'}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`gap-2 ${isRecording ? 'animate-pulse ring-2 ring-destructive' : ''}`}
                  >
                    {isRecording ? <Square className="size-4" /> : <Mic className="size-4" />}
                    {isRecording ? `Stop Recording (${formatTimer(recordingSeconds)})` : 'Speak Your Answer'}
                  </Button>
                  {isRecording && (
                    <span className="text-xs font-medium text-destructive animate-pulse flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-destructive animate-ping" />
                      Listening & transcribing speech...
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  You can speak into your microphone or type in the box below
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">Your Technical Solution / Explanation:</label>
                  {textAnswer && (
                    <Button variant="ghost" size="sm" onClick={() => setTextAnswer('')} className="h-6 text-xs text-muted-foreground">
                      Clear Text
                    </Button>
                  )}
                </div>
                <Textarea
                  placeholder="Speak your response or type technical details, trade-offs, architecture choices..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={6}
                  className="resize-none font-mono text-sm leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  {textAnswer.trim() ? `${textAnswer.trim().split(/\s+/).length} words spoken/typed` : 'No answer entered yet'}
                </div>
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
                <h2 className="text-2xl font-bold">{summary.subject}</h2>
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
