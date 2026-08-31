import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Code2, Play, CheckCircle, ChevronLeft, ChevronRight, TerminalSquare, AlertCircle } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import codingQuestionsData from '@/data/codingQuestions.json'
import { useExamStore } from '@/stores/examStore'

type CodingLanguage = 'javascript' | 'python' | 'java' | 'cpp' | 'c'

export function CodingPracticePage() {
  const [isExamStarted, setIsExamStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])
  const [language, setLanguage] = useState<CodingLanguage>('javascript')
  const [code, setCode] = useState<string>('')
  const [output, setOutput] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Easy')
  const [antiCheatModalType, setAntiCheatModalType] = useState<'warning' | 'terminated' | null>(null)
  const strikeCountRef = useRef(0)
  const { setExamActive } = useExamStore()

  const allDifficulties = ['Easy', 'Medium', 'Hard']

  const currentQuestion = filteredQuestions[currentQuestionIndex]

  // Format time display
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isExamStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isExamStarted && filteredQuestions.length > 0) {
      handleSubmitCode(true)
    }
    return () => clearInterval(timer)
  }, [isExamStarted, timeLeft, filteredQuestions.length])

  // Initialize code when language or question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.starterCode) {
      setCode(currentQuestion.starterCode[language as keyof typeof currentQuestion.starterCode] || '')
    }
  }, [language, currentQuestionIndex, currentQuestion])

  const handleStartExam = async () => {
    if (selectedDifficulty === 'All') return;
    try {
      const res = await fetch(`http://localhost:8000/coding_assessment?difficulty=${selectedDifficulty}&user_id=test-user-123`)
      const data = await res.json()
      if (data.error || !data.length) {
        alert("Failed to fetch assessment.")
        return
      }
      setFilteredQuestions(data)
      setCurrentQuestionIndex(0)
      strikeCountRef.current = 0
      setIsExamStarted(true)
      setExamActive(true)
      setTimeLeft(data[0].time_limit_minutes * 60)
    } catch (e) {
      console.error(e)
    }
  }

  const handleFinishExam = () => {
    setIsExamStarted(false)
    setExamActive(false)
    setOutput(null)
  }

  // Anti-cheat tab change listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isExamStarted) {
        strikeCountRef.current += 1;
        if (strikeCountRef.current >= 3) {
          setAntiCheatModalType('terminated');
          handleFinishExam();
        } else {
          setAntiCheatModalType('warning');
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isExamStarted) {
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
  }, [isExamStarted]);

  const handleRunCode = () => {
    setIsRunning(true)
    setOutput(null)
    
    // Simulate code execution delay
    setTimeout(() => {
      setIsRunning(false)
      setOutput('Running test cases...\nTest Case 1: Passed\nTest Case 2: Passed\n\nAll test cases passed successfully!')
    }, 1500)
  }

  const handleSubmitCode = async (autoSubmit: boolean = false) => {
    // In a real scenario, we would run test cases on backend.
    // For now, if user clicks submit, assume correct. If timeout, assume incorrect.
    const isCorrect = !autoSubmit;
    
    try {
      await fetch('http://localhost:8000/submit_answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "test-user-123",
          question_id: String(currentQuestion.id),
          question_type: "CODING",
          is_correct: isCorrect
        })
      });
    } catch (err) {
      console.error(err)
    }

    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setOutput(null)
      setTimeLeft(filteredQuestions[currentQuestionIndex + 1].time_limit_minutes * 60)
    } else {
      handleFinishExam()
    }
  }

  if (!isExamStarted) {
    return (
      <div className="space-y-6 pb-8 max-w-4xl mx-auto">
        <PageHeader 
          title="Coding Assessment" 
          description="Evaluate your problem-solving and coding skills in a real-time environment."
        />
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm py-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Code2 className="size-16 text-primary" />
            <h2 className="text-2xl font-bold">Start Your Coding Exam</h2>
            <p className="text-muted-foreground max-w-md">
              Customize your practice by selecting a specific topic or company, or take a mixed assessment.
            </p>
            
            <div className="flex space-x-4 mt-2">
              <div className="flex flex-col text-left mx-auto">
                <label className="text-sm font-medium mb-1">Assessment Difficulty</label>
                <select 
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="bg-background border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-48"
                >
                  {allDifficulties.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="text-sm text-muted-foreground pt-2">
              {filteredQuestions.length} question(s) available
            </div>

            <Button 
              size="lg" 
              onClick={handleStartExam} 
              className="mt-4" 
            >
              Begin Assessment
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] -mt-4">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold">Question {currentQuestionIndex + 1} of {filteredQuestions.length}</h2>
          <div className="flex space-x-2">
            <Badge variant={currentQuestion.difficulty === 'Easy' ? 'secondary' : currentQuestion.difficulty === 'Medium' ? 'default' : 'destructive'}>
              {currentQuestion.difficulty}
            </Badge>
            {currentQuestion.topics?.slice(0, 2).map((t: string) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
            {currentQuestion.companies?.slice(0, 2).map((c: string) => (
              <Badge key={c} variant="outline" className="border-primary/50 text-primary">{c}</Badge>
            ))}
          </div>
        </div>
        <div className="flex space-x-4 items-center">
          <div className={`font-mono text-xl font-bold ${timeLeft < 300 ? 'text-destructive' : ''}`}>
            {formatTime(timeLeft)}
          </div>
          <Button variant="destructive" size="sm" onClick={handleFinishExam} className="ml-2">
            Finish Exam
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Pane: Question */}
        <div className="w-1/2 flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-4 border-b bg-muted/30 font-medium">
            {currentQuestion.title}
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{currentQuestion.description}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Examples</h3>
              <div className="space-y-4">
                {currentQuestion.examples.map((ex, idx) => (
                  <div key={idx} className="bg-muted p-4 rounded-lg font-mono text-sm">
                    <div><span className="font-bold">Input:</span> {ex.input}</div>
                    <div><span className="font-bold">Output:</span> {ex.output}</div>
                    {ex.explanation && <div className="mt-2 text-muted-foreground"><span className="font-bold">Explanation:</span> {ex.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Constraints</h3>
              <ul className="list-disc pl-5 space-y-1">
                {currentQuestion.constraints.map((c, idx) => (
                  <li key={idx} className="text-sm">{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Pane: Editor */}
        <div className="w-1/2 flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="flex justify-between items-center p-2 border-b bg-muted/30">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value as CodingLanguage)}
              className="bg-background border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={handleRunCode} disabled={isRunning}>
                <Play className="w-4 h-4 mr-2" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button size="sm" onClick={() => handleSubmitCode(false)} disabled={isRunning}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Submit
              </Button>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={language === 'c' || language === 'cpp' ? 'cpp' : language}
              theme="vs-dark"
              value={code}
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Console / Output area */}
          <div className="h-48 border-t bg-muted/10 flex flex-col">
            <div className="p-2 border-b bg-muted/30 text-sm font-medium flex items-center text-muted-foreground">
              <TerminalSquare className="w-4 h-4 mr-2" />
              Console Output
            </div>
            <div className="p-4 font-mono text-sm flex-1 overflow-y-auto whitespace-pre-wrap">
              {output || <span className="text-muted-foreground">Run your code to see the output here...</span>}
            </div>
          </div>
        </div>
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
                ? `Please do not switch tabs or leave the window. You have ${3 - strikeCountRef.current} warning(s) left before the coding assessment is automatically exited.`
                : 'We detected repeated tab switching. As per the anti-cheat policy, your assessment has been automatically exited.'}
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
