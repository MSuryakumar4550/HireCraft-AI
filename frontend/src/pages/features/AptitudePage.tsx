import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { MOCK_APTITUDE_QUESTIONS, type MockAptitudeQuestion } from '@/data/mockAptitudeQuestions'
import { CheckCircle2, ChevronRight, ChevronDown, Brain, Clock, AlertCircle, Sparkles, Calculator, Puzzle, BookOpen, LayoutGrid } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useExamStore } from '@/stores/examStore'
import { aptitudeService } from '@/services/aptitudeService'

const AnimatedBrainPulse = () => {
  return (
    <div className="relative w-[80px] h-[80px] flex items-center justify-center shrink-0 group">
      {/* Background circle */}
      <div className="absolute inset-0 rounded-full bg-[#8C6A54]/10 transition-colors group-hover:bg-[#8C6A54]/20" />

      {/* Inner container */}
      <div className="relative w-11 h-11 flex items-center justify-center">
        
        {/* Glow Aura Layer */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center blur-[3px]"
          animate={{
            scale: [1, 1.35, 1.35, 1, 1], // Expands further out to create the aura
            opacity: [0.2, 1, 1, 0.2, 0.2] // High opacity required for yellow to be visible on light backgrounds
          }}
          transition={{ 
            duration: 2.5, 
            ease: "easeInOut", 
            repeat: Infinity, 
            times: [0, 0.32, 0.48, 0.8, 1] 
          }}
        >
          {/* Warm gold/amber glow */}
          <Brain className="w-full h-full text-[#E8B84B]" />
        </motion.div>

        {/* Solid Foreground Brain */}
        <motion.div 
          className="relative z-10 w-full h-full flex items-center justify-center"
          animate={{
            scale: [1, 1.06, 1.06, 1, 1] // Subtle pulse
          }}
          transition={{ 
            duration: 2.5, 
            ease: "easeInOut", 
            repeat: Infinity, 
            times: [0, 0.32, 0.48, 0.8, 1] 
          }}
        >
          <Brain className="w-full h-full text-[#8C6A54]" />
        </motion.div>

      </div>
    </div>
  )
}

export function AptitudePage() {
  const [questions, setQuestions] = useState<MockAptitudeQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [assessment, setAssessment] = useState<{ score: number; accuracy: number } | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [antiCheatModalType, setAntiCheatModalType] = useState<'warning' | 'terminated' | null>(null)
  const strikeCountRef = useRef(0)
  const { setExamActive } = useExamStore()
  
  // Timer state (1.5 minutes = 90 seconds per question)
  const [timeLeft, setTimeLeft] = useState(90)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isStarted && !isFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && !isFinished) {
      // Auto submit when time is up
      handleNext(true)
    }
    return () => clearInterval(timer)
  }, [isStarted, isFinished, timeLeft])

  // Anti-cheat tab change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted && !isFinished) {
        strikeCountRef.current += 1;
        if (strikeCountRef.current >= 3) {
          setAntiCheatModalType('terminated');
          handleFinish();
        } else {
          setAntiCheatModalType('warning');
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted && !isFinished) {
        e.preventDefault();
        e.returnValue = ''; // Standard way to trigger the browser's confirmation dialog
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setExamActive(false);
    };
  }, [isStarted, isFinished]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const startTest = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/questions')
      if (!response.ok) throw new Error("Failed to fetch questions")
      const data = await response.json()
      
      const mappedQuestions: MockAptitudeQuestion[] = data.map((q: any) => ({
        id: q.id,
        topic: q.topic,
        questionText: q.question_text,
        options: q.options_json,
        correctOption: q.correct_answer,
        explanation: q.explanation_html
      }))

      setQuestions(mappedQuestions)
      setAnswers({})
      strikeCountRef.current = 0
      setIsStarted(true)
      setExamActive(true)
      setTimeLeft(90) // 90 secs per question
    } catch (err) {
      console.error("Failed to start test", err)
      // Fallback to mock data if backend fails
      setQuestions(MOCK_APTITUDE_QUESTIONS)
      setAnswers({})
      strikeCountRef.current = 0
      setIsStarted(true)
      setExamActive(true)
      setTimeLeft(90)
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Calculate score locally
      let score = 0;
      questions.forEach(q => {
        if (answers[q.id] === q.correctOption) {
          score += 1;
        }
      });
      
      const accuracy = questions.length > 0 ? (score / questions.length) * 100 : 0;
      
      setAssessment({
        score,
        accuracy: parseFloat(accuracy.toFixed(2))
      });

      // Save score to Java backend to sync with AI Memory and Reports
      await aptitudeService.saveScore(score, questions.length, parseFloat(accuracy.toFixed(2)));

      setIsFinished(true)
      setExamActive(false)
    } catch (err) {
      console.error("Failed to finish test", err)
      alert("Failed to submit test results to the server. Please check the backend console.")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = async (autoSubmit: boolean = false) => {
    if (!autoSubmit && !selectedOption) return
    const currentQ = questions[currentQuestionIndex]
    
    // Save local answer
    if (selectedOption) {
      setAnswers(prev => ({ ...prev, [currentQ.id]: selectedOption }))
    }
    
    // Submit answer to Python backend to track history
    try {
      await fetch('http://localhost:8000/submit_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "test-user-123", // TODO: replace with real user ID from context
          question_id: String(currentQ.id),
          question_type: "APTITUDE",
          is_correct: selectedOption === currentQ.correctOption
        })
      });
    } catch (err) {
      console.error("Failed to record answer history", err);
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setTimeLeft(90) // reset timer for next question
    } else {
      await handleFinish()
    }
  }

  if (!isStarted && !isFinished) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] font-sans pb-12 px-4 sm:px-8 pt-6 -mx-4 sm:-mx-8 -mt-6">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div>
             <h1 className="text-3xl font-bold text-gray-900">Aptitude Assessment</h1>
             <p className="text-gray-600 mt-2">Test your logical reasoning, quantitative, and verbal aptitude.</p>
          </div>

          {/* Top Row: Exam & Skill Mastery */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Main Exam Card */}
              <Card className="bg-white shadow-sm border-0 h-full">
                <CardContent className="p-8 flex flex-col sm:flex-row items-start gap-6 h-full">
                   <AnimatedBrainPulse />
                   <div className="flex-1 flex flex-col justify-center h-full">
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">Aptitude Simulation Exam</h2>
                     <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                       <span className="flex items-center"><AlertCircle className="w-4 h-4 mr-1" /> 15 Questions</span>
                       <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> 1.5 Min / Question</span>
                     </div>
                     <p className="text-gray-600 mb-6">
                       This simulation replicates a real-world aptitude test environment. Your score will be analyzed and added to your AI Memory Engine.
                     </p>
                     <div className="mt-auto flex flex-wrap gap-4">
                       <Button size="lg" onClick={startTest} disabled={loading} className="bg-[#8C6A54] hover:bg-[#7A5A46] text-white">
                         {loading ? "Initializing Exam..." : "Start Assessment"}
                       </Button>
                       <Button size="lg" variant="outline" className="border-[#8C6A54] text-[#8C6A54] hover:bg-[#8C6A54] hover:text-white" onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>
                         Explore Practice Topics
                       </Button>
                     </div>
                   </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              {/* Right Sidebar: Skill Progress */}
              <Card className="bg-white border-0 shadow-sm h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Skill Mastery</CardTitle>
                  <CardDescription>Based on your AI Memory Engine</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: 'Quantitative', percent: 68 },
                    { label: 'Logical', percent: 85 },
                    { label: 'Verbal', percent: 42 }
                  ].map(skill => (
                    <div key={skill.label} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{skill.label}</span>
                        <span className="text-gray-500">{skill.percent}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#8C6A54] rounded-full transition-all duration-500" 
                          style={{ width: `${skill.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Focus Card (Full Width) */}
          <Card className="bg-[#8C6A54]/5 border border-[#8C6A54]/20 shadow-none">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#8C6A54] flex items-center gap-2 mb-1">
                   <Sparkles className="w-5 h-5" /> AI Recommendation
                </h3>
                <p className="text-gray-700">You struggled with <strong>Time & Work</strong> yesterday. Take a 5-minute guided drill to improve.</p>
              </div>
              <Button variant="outline" className="border-[#8C6A54] text-[#8C6A54] hover:bg-[#8C6A54] hover:text-white whitespace-nowrap bg-transparent">
                Start Drill
              </Button>
            </CardContent>
          </Card>

          {/* Topic Gym Grid (Full Width) */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Topic Gym</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: 'Quantitative Aptitude', icon: Calculator, desc: 'Numbers, math & logic' },
                { title: 'Logical Reasoning', icon: Puzzle, desc: 'Puzzles & patterns' },
                { title: 'Verbal Ability', icon: BookOpen, desc: 'Grammar & vocab' },
                { title: 'Non-Verbal', icon: LayoutGrid, desc: 'Visual reasoning' }
              ].map(topic => (
                 <Card key={topic.title} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                         <div className="p-2 rounded-lg bg-gray-50 group-hover:bg-[#8C6A54]/10 transition-colors">
                           <topic.icon className="w-6 h-6 text-gray-600 group-hover:text-[#8C6A54] transition-colors" />
                         </div>
                         <button className="text-sm font-medium text-[#8C6A54] hover:underline flex items-center">
                           Practice <ChevronRight className="w-4 h-4 ml-1" />
                         </button>
                      </div>
                      <h4 className="font-semibold text-gray-900">{topic.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{topic.desc}</p>
                    </CardContent>
                 </Card>
              ))}
            </div>
          </div>

        </div>
      </div>
    )
  }

  if (isFinished && assessment) {
    return (
      <div className="space-y-6 pb-8 max-w-3xl mx-auto text-center mt-12">
        <CheckCircle2 className="w-20 h-20 mx-auto text-emerald-500 mb-6" />
        <h1 className="text-4xl font-bold mb-2">Assessment Completed!</h1>
        <p className="text-xl text-muted-foreground mb-8">You scored {assessment.score} out of {questions.length} ({assessment.accuracy}%)</p>
        
        <Card className="bg-muted/30 border-muted">
          <CardContent className="p-6">
            <p className="mb-4">Your performance metrics have been dynamically updated in your AI Memory Engine.</p>
            <Button asChild variant="outline">
              <a href="/ai-memory">View AI Memory Graph</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = questions[currentQuestionIndex]

  return (
    <div className="pb-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-6">
      {/* Left side: Question Area */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
          <div>
            <h2 className="text-xl font-semibold">Question {currentQuestionIndex + 1}</h2>
            <p className="text-sm text-muted-foreground">Multiple Choice Question</p>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">{currentQ?.topic}</Badge>
        </div>

        <Card className="border-muted shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-medium leading-relaxed">
              {currentQ?.questionText}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentQ?.options.map((option, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedOption(option)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedOption === option 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted hover:border-primary/40'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedOption === option ? 'border-primary' : 'border-muted-foreground'
                  }`}>
                    {selectedOption === option && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="text-base">{option}</span>
                </div>
              </div>
            ))}
          </CardContent>
          <CardFooter className="justify-between border-t pt-6 bg-muted/10">
            <div className="text-sm text-muted-foreground">
              Ensure you have selected the correct option before proceeding.
            </div>
            <Button 
              onClick={() => handleNext(false)} 
              disabled={!selectedOption || loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
            >
              {loading ? "Saving..." : currentQuestionIndex < questions.length - 1 ? "Save & Next" : "Submit Exam"}
              {!loading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Right side: Exam Info & Palette */}
      <div className="w-full md:w-72 flex flex-col gap-6">
        <Card className="border-muted shadow-sm text-center border-t-4 border-t-primary">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Time Remaining</h3>
            <div className={`text-4xl font-mono font-bold ${timeLeft < 300 ? 'text-destructive' : ''}`}>
              {formatTime(timeLeft)}
            </div>
            {timeLeft < 300 && <p className="text-xs text-destructive mt-2 animate-pulse">Less than 5 minutes left!</p>}
          </CardContent>
        </Card>

        <Card className="border-muted shadow-sm flex-1">
          <CardHeader>
            <CardTitle className="text-lg">Question Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, idx) => {
                let statusClass = "bg-muted text-muted-foreground border-transparent" // Pending
                if (idx < currentQuestionIndex) {
                  statusClass = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" // Answered
                } else if (idx === currentQuestionIndex) {
                  statusClass = "bg-primary text-primary-foreground border-primary ring-2 ring-primary/30 ring-offset-1" // Current
                }

                return (
                  <div 
                    key={idx} 
                    className={`flex items-center justify-center h-10 w-10 rounded-md border text-sm font-medium transition-all ${statusClass}`}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>

            <div className="mt-8 space-y-3 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800 mr-3"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-primary mr-3"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-muted border border-transparent mr-3"></div>
                <span>Not Visited</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={antiCheatModalType !== null} onOpenChange={(open) => !open && setAntiCheatModalType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              {antiCheatModalType === 'warning' ? 'Warning: Tab Switch Detected' : 'Assessment Terminated'}
            </DialogTitle>
            <DialogDescription>
              {antiCheatModalType === 'warning' 
                ? `Please do not switch tabs or leave the window. You have ${3 - strikeCountRef.current} warning(s) left before the assessment is automatically submitted.`
                : 'We detected repeated tab switching. As per the anti-cheat policy, your assessment has been automatically submitted.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setAntiCheatModalType(null)}>Acknowledge</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
