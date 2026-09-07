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
  VolumeX,
  Award,
  Radio,
  Server,
  Terminal,
  Layers,
  ShieldCheck,
  Flame,
  HeartHandshake,
  Lightbulb,
  Target
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
  category: 'CORE' | 'TECHNICAL' | 'BEHAVIORAL'
  description: string
  icon: React.ElementType
  color: string
}

const ALL_SUBJECT_OPTIONS: SubjectOption[] = [
  // Core CS Subjects
  {
    id: 'DBMS',
    name: 'Database Management Systems',
    category: 'CORE',
    description: 'ACID properties, indexing, SQL queries, normalization, and transactions.',
    icon: Database,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
  {
    id: 'OPERATING_SYSTEMS',
    name: 'Operating Systems',
    category: 'CORE',
    description: 'Processes, threads, deadlock handling, memory paging, and CPU scheduling.',
    icon: Cpu,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'COMPUTER_NETWORKS',
    name: 'Computer Networks',
    category: 'CORE',
    description: 'OSI 7-layer model, TCP 3-way handshake, UDP, DNS, and HTTP/3 QUIC.',
    icon: Network,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    id: 'OOPS_DATA_STRUCTURES',
    name: 'OOPs & Data Structures',
    category: 'CORE',
    description: 'Encapsulation, inheritance, polymorphism, HashMap, Trees, and Garbage Collection.',
    icon: Code,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },

  // Technical Interview Domains
  {
    id: 'SYSTEM_DESIGN',
    name: 'System Design & Architecture',
    category: 'TECHNICAL',
    description: 'Scalability, microservices, load balancing, caching strategies, and database sharding.',
    icon: Server,
    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  },
  {
    id: 'BACKEND_DEVELOPMENT',
    name: 'Java & Backend Engineering',
    category: 'TECHNICAL',
    description: 'Spring Boot REST APIs, multithreading, concurrency, memory management, and JPA.',
    icon: Terminal,
    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  },
  {
    id: 'DEVOPS_CLOUD',
    name: 'Cloud & Infrastructure',
    category: 'TECHNICAL',
    description: 'Docker containers, Kubernetes orchestration, CI/CD pipelines, AWS/GCP services.',
    icon: Layers,
    color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  },
  {
    id: 'SECURITY_APIS',
    name: 'API Security & Design',
    category: 'TECHNICAL',
    description: 'OAuth2/JWT authentication, rate limiting, encryption, OWASP top 10 security.',
    icon: ShieldCheck,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },

  // Behavioral Competency Tracks
  {
    id: 'LEADERSHIP_INITIATIVE',
    name: 'Leadership & Initiative',
    category: 'BEHAVIORAL',
    description: 'Demonstrating ownership, driving project outcomes, and mentoring teammates.',
    icon: Flame,
    color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  },
  {
    id: 'TEAMWORK_CONFLICT',
    name: 'Teamwork & Conflict Resolution',
    category: 'BEHAVIORAL',
    description: 'Navigating disagreements, cross-functional collaboration, and constructive feedback.',
    icon: HeartHandshake,
    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  },
  {
    id: 'PROBLEM_SOLVING_ADAPTABILITY',
    name: 'Problem Solving & Adaptability',
    category: 'BEHAVIORAL',
    description: 'Handling tight deadlines, changing project scope, and unblocking critical failures.',
    icon: Lightbulb,
    color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  },
  {
    id: 'GOAL_ACHIEVEMENT',
    name: 'Goal Achievement & Impact',
    category: 'BEHAVIORAL',
    description: 'Overcoming setbacks, measuring project success, and delivering key metrics.',
    icon: Target,
    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  },
]

export function AIVoiceInterviewPage() {
  const [step, setStep] = useState<'setup' | 'interview' | 'summary'>('setup')
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | 'CORE' | 'TECHNICAL' | 'BEHAVIORAL'>('ALL')
  
  // Setup selections
  const [selectedSubject, setSelectedSubject] = useState<string>('OPERATING_SYSTEMS')
  const [experienceLevel, setExperienceLevel] = useState<string>('Entry Level')
  const [difficultyLevel, setDifficultyLevel] = useState<string>('MEDIUM')
  
  // Session & Question state
  const [session, setSession] = useState<InterviewSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null)
  const [questionIndex, setQuestionIndex] = useState<number>(1)
  const [totalQuestions] = useState<number>(4)
  
  // Audio & Recording state
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0)
  const [textAnswer, setTextAnswer] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  
  // Summary state
  const [summary, setSummary] = useState<InterviewSummaryResponse | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Stop voice synthesis and cleanup on unmount
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

  // Handler: Start New Interview Session
  const handleStartSession = async () => {
    setIsSubmitting(true)
    try {
      const selectedSubObj = ALL_SUBJECT_OPTIONS.find((s) => s.id === selectedSubject)
      const isBehavioral = selectedSubObj?.category === 'BEHAVIORAL'
      const newSession = await voiceInterviewService.createSession({
        interviewType: isBehavioral ? 'BEHAVIORAL' : 'TECHNICAL',
        subject: selectedSubject,
        experienceLevel,
        difficultyLevel,
      })

      const startedSession = await voiceInterviewService.startInterview(newSession.id || String(newSession.interviewSessionId))
      setSession(startedSession)
      
      const q = await voiceInterviewService.getCurrentQuestion(startedSession.id || String(startedSession.interviewSessionId))
      if (!q) {
        toast.error('No questions available in question bank for this subject.')
        return
      }
      setCurrentQuestion(q)
      setQuestionIndex(1)
      setStep('interview')
      
      // Auto-vocalize question
      const qText = q.questionText || q.question
      if (qText) {
        setTimeout(() => speakQuestion(qText), 400)
      }

      toast.success('Interview session started! AI interviewer is ready.')
    } catch (err: any) {
      toast.error(err.message || 'Failed to start interview session. Ensure Spring Boot backend is running on port 8080.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handler: Toggle Microphone Recording (Real-Time STT)
  const startRecording = async () => {
    stopSpeaking()
    try {
      // 1. Browser Native Speech-to-Text Recognition
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
          console.warn('Speech recognition status:', event.error)
        }

        recognition.start()
        recognitionRef.current = recognition
      }

      // 2. Audio Stream Track (for visual waveform / latency timer)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(200)

      setIsRecording(true)
      setRecordingSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      toast.error('Microphone access denied or unavailable. You can type your answer in the box below.')
    }
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
      recognitionRef.current = null
    }
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      setIsRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  // Handler: Submit Answer (Adaptive Turn Flow)
  const handleSubmitAnswer = async () => {
    if (!session || !currentQuestion) return

    stopSpeaking()
    stopRecording()

    const finalAnswer = textAnswer.trim()
    if (!finalAnswer) {
      toast.error('Please speak your response or type notes into the answer box before submitting.')
      return
    }

    setIsSubmitting(true)
    try {
      const sessionId = session.id || String(session.interviewSessionId)

      // Submit answer -> evaluated live by Qwen2.5/Groq AI -> returns adaptive next question
      const nextQ = await voiceInterviewService.submitAnswer(sessionId, {
        questionNo: questionIndex,
        questionId: currentQuestion.id,
        answerText: finalAnswer,
        transcript: finalAnswer,
        responseDurationSeconds: recordingSeconds,
      })

      setTextAnswer('')
      setRecordingSeconds(0)

      // Check if another question is provided and below limit
      if (nextQ && questionIndex < totalQuestions) {
        setCurrentQuestion(nextQ)
        setQuestionIndex((prev) => prev + 1)
        toast.success(`Answer evaluated! Question ${questionIndex + 1} loaded.`)
        
        const qText = nextQ.questionText || nextQ.question
        if (qText) {
          setTimeout(() => speakQuestion(qText), 300)
        }
      } else {
        // Finalize interview and fetch comprehensive summary report
        await voiceInterviewService.completeInterview(sessionId)
        const summaryData = await voiceInterviewService.getSummary(sessionId)
        setSummary(summaryData)
        setStep('summary')
        toast.success('Interview complete! Evaluation scorecard generated.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error evaluating answer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="AI Voice Interview"
        description="Experience an interactive, adaptive technical mock interview evaluated live by local Qwen AI and Google Gemini."
      />

      {/* STEP 1: SETUP / SUBJECT SELECTION */}
      {step === 'setup' && (
        <div className="space-y-8">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <CardTitle>Select an Interview Domain or Track</CardTitle>
                  </div>
                  <CardDescription className="mt-1">
                    Choose from 12 specialized tracks (3,000 questions) evaluated live by local Qwen AI and Gemini.
                  </CardDescription>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'ALL', label: 'All Tracks (12)' },
                    { id: 'CORE', label: 'Core CS (4)' },
                    { id: 'TECHNICAL', label: 'Technical (4)' },
                    { id: 'BEHAVIORAL', label: 'Behavioral (4)' }
                  ].map(tab => (
                    <Button
                      key={tab.id}
                      variant={activeCategoryTab === tab.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setActiveCategoryTab(tab.id as any)}
                      className="text-xs h-8"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ALL_SUBJECT_OPTIONS
                .filter(sub => activeCategoryTab === 'ALL' || sub.category === activeCategoryTab)
                .map((sub) => {
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
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-normal py-0">
                            {sub.category}
                          </Badge>
                          {isSelected && <CheckCircle2 className="size-4 text-primary" />}
                        </div>
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
                <CardTitle className="text-base">Starting Difficulty</CardTitle>
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
              {isSubmitting ? 'Initializing Session...' : 'Start AI Voice Interview'}
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
                    {currentQuestion.subject || selectedSubject.replace('_', ' ')}
                  </Badge>
                  <Badge variant="secondary">{currentQuestion.difficulty || difficultyLevel}</Badge>
                  {currentQuestion.topic && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      Topic: {currentQuestion.topic}
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Question {questionIndex} of {totalQuestions}
                </p>
              </div>
              <div className="w-full sm:w-48 space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Interview Progress</span>
                  <span>{Math.round((questionIndex / totalQuestions) * 100)}%</span>
                </div>
                <Progress value={(questionIndex / totalQuestions) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Question Display Card */}
          <Card className="shadow-lg">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-primary font-semibold">
                  <Brain className="size-5" /> AI Interviewer Question
                </div>
                
                {/* Voice Replay Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const text = currentQuestion.questionText || currentQuestion.question
                    if (isSpeaking) {
                      stopSpeaking()
                    } else if (text) {
                      speakQuestion(text)
                    }
                  }}
                  className="gap-2"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="size-4 text-destructive" /> Stop Audio
                    </>
                  ) : (
                    <>
                      <Volume2 className="size-4 text-primary" /> Listen to Question
                    </>
                  )}
                </Button>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground leading-snug">
                {currentQuestion.questionText || currentQuestion.question}
              </h2>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Voice Microphone Recorder */}
              <div className="rounded-xl border bg-muted/30 p-6 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Radio className="size-4 text-primary animate-pulse" />
                  Speak your response aloud or edit transcript below
                </div>

                <div className="flex items-center justify-center gap-4 py-4">
                  {!isRecording ? (
                    <Button 
                      size="lg" 
                      variant="default" 
                      onClick={startRecording} 
                      className="size-16 rounded-full p-0 shadow-lg hover:scale-105 transition-transform"
                      title="Click to start speaking"
                    >
                      <Mic className="size-7" />
                    </Button>
                  ) : (
                    <Button 
                      size="lg" 
                      variant="destructive" 
                      onClick={stopRecording} 
                      className="size-16 rounded-full p-0 animate-pulse hover:scale-105 transition-transform"
                      title="Click to stop recording"
                    >
                      <Square className="size-7" />
                    </Button>
                  )}
                </div>

                {isRecording ? (
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-destructive">
                    <span className="size-2 rounded-full bg-destructive animate-ping" />
                    Listening & Transcribing ({recordingSeconds}s)...
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Click the microphone to start speaking. Speech will automatically transcribe in real time.
                  </p>
                )}
              </div>

              {/* Text Fallback / Live Transcript Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    Speech Transcript / Response Notes:
                  </label>
                  {isRecording && (
                    <Badge variant="outline" className="text-xs text-destructive border-destructive/40 animate-pulse">
                      Live STT Active
                    </Badge>
                  )}
                </div>
                <Textarea
                  placeholder="Your speech transcript will appear here in real-time as you talk, or you can type directly..."
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  rows={5}
                  className="resize-none font-sans"
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
                  {isSubmitting 
                    ? 'AI Model Evaluating Answer...' 
                    : questionIndex >= totalQuestions 
                    ? 'Submit & Finish Interview' 
                    : 'Submit & Next Question'}
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
                  <Award className="size-6" /> Technical Interview Complete
                </div>
                <h2 className="text-2xl font-bold">
                  {summary.subject || selectedSubject.replace('_', ' ')} Evaluation Scorecard
                </h2>
                <p className="text-sm text-muted-foreground">{summary.summaryFeedback}</p>
              </div>
              <div className="grid place-items-center rounded-2xl bg-card border p-6 shadow-sm min-w-[150px]">
                <span className="text-xs uppercase font-semibold text-muted-foreground">Overall Score</span>
                <span className="text-4xl font-extrabold text-emerald-500 mt-1">
                  {Math.round(summary.overallScore)}
                </span>
                <span className="text-xs text-muted-foreground mt-1">/ 100</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-emerald-600 flex items-center gap-2 text-base">
                  <CheckCircle2 className="size-5" /> Demonstrated Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {summary.overallStrengths && summary.overallStrengths.length > 0 ? (
                  summary.overallStrengths.map((str, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{str}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Solid attempt across questions.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-amber-600 flex items-center gap-2 text-base">
                  <AlertCircle className="size-5" /> Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {summary.areasForImprovement && summary.areasForImprovement.length > 0 ? (
                  summary.areasForImprovement.map((area, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{area}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No critical weaknesses identified.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Question-by-Question Breakdown */}
          {summary.questionEvaluations && summary.questionEvaluations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Question Breakdown & Rubric Feedback</CardTitle>
                <CardDescription>
                  Detailed scoring based on technical depth and concepts covered.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {summary.questionEvaluations.map((evalItem, idx) => (
                  <div key={idx} className="rounded-lg border p-4 space-y-2 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Q{evalItem.questionNo || idx + 1}</Badge>
                        <span className="font-semibold text-sm">{evalItem.topic || 'Core Concept'}</span>
                        {evalItem.difficultyLevel && (
                          <Badge variant="secondary" className="text-xs">{evalItem.difficultyLevel}</Badge>
                        )}
                      </div>
                      <Badge className={evalItem.score >= 7 ? 'bg-emerald-500' : evalItem.score >= 4.5 ? 'bg-amber-500' : 'bg-destructive'}>
                        {evalItem.score} / 10
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground">{evalItem.questionText}</p>
                    {evalItem.transcript && (
                      <p className="text-xs text-muted-foreground italic border-l-2 pl-2 border-primary/30">
                        "{evalItem.transcript}"
                      </p>
                    )}
                    {evalItem.feedback && (
                      <p className="text-xs text-muted-foreground mt-1">{evalItem.feedback}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={() => setStep('setup')} className="gap-2">
              <RotateCcw className="size-4" /> Start Another Technical Interview
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
