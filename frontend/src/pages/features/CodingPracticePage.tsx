import { useState, useEffect, useRef } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Code2, Play, CheckCircle, TerminalSquare, AlertCircle, Award } from 'lucide-react'
import Editor from '@monaco-editor/react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useExamStore } from '@/stores/examStore'
import { apiClient } from '@/services/apiClient'

type CodingLanguage = 'python' | 'java' | 'cpp'

export function CodingPracticePage() {
  const [isExamStarted, setIsExamStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([])
  const [language, setLanguage] = useState<CodingLanguage>('python')
  const [code, setCode] = useState<string>('')
  const [output, setOutput] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Easy')
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [antiCheatModalType, setAntiCheatModalType] = useState<'warning' | 'terminated' | null>(null)
  const [savedCodes, setSavedCodes] = useState<Record<number, string>>({})
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null)
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

  // Reset saved codes when language changes (old saved code is for a different language)
  useEffect(() => {
    if (isExamStarted && currentQuestion) {
      setSavedCodes({})
      setCode(currentQuestion.starterCode?.[language as keyof typeof currentQuestion.starterCode] || '')
    }
  }, [language])

  // Initialize code when question changes (within same assessment + same language)
  useEffect(() => {
    if (currentQuestion) {
      if (savedCodes[currentQuestionIndex] !== undefined) {
        setCode(savedCodes[currentQuestionIndex])
      } else {
        setCode(currentQuestion.starterCode?.[language as keyof typeof currentQuestion.starterCode] || '')
      }
    } else {
      setCode('')
    }
  }, [currentQuestionIndex, currentQuestion])

  const handleStartExam = async () => {
    if (selectedDifficulty === 'All') return;
    try {
      const res = await apiClient.post<any>('/api/coding/assessments', {
        difficultyLevel: selectedDifficulty.toUpperCase(),
        assessmentMode: 'TOPIC_WISE'
      });
      
      const data = res.data;
      if (!data || !data.questions || !data.questions.length) {
        alert("Failed to fetch assessment.")
        return
      }
      setAssessmentId(data.codingAssessmentId)
      setFilteredQuestions(data.questions)
      setCurrentQuestionIndex(0)
      setSavedCodes({})
      setCode('')
      setOutput(null)
      strikeCountRef.current = 0
      setIsExamStarted(true)
      setExamActive(true)
      setTimeLeft(data.totalTimeLimitMinutes * 60)
    } catch (e) {
      console.error(e)
      alert("Error starting exam. Please ensure backend is running.")
    }
  }

  const handleFinishExam = async () => {
    if (assessmentId) {
      try {
        const res = await apiClient.post<any>(`/api/coding/assessments/${assessmentId}/complete`);
        setAssessmentResult(res.data);
      } catch (e) {
        console.error("Error completing exam", e);
      }
    }
    setIsExamStarted(false)
    setExamActive(false)
    setOutput(null)
    setSavedCodes({})
    setCode('')
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

  const executeCode = async (isAutoSubmit: boolean) => {
    if (!assessmentId) return;
    setIsRunning(true)
    setOutput('Submitting to Judge0...')
    
    try {
      await apiClient.post(`/api/coding/assessments/${assessmentId}/submit`, {
        questionNo: currentQuestionIndex + 1,
        language: language,
        sourceCode: code
      });

      // Poll for result
      pollSubmissionResult(isAutoSubmit);
    } catch (err: any) {
      console.error(err);
      setOutput(`Error: ${err.message || 'Submission failed'}`);
      setIsRunning(false);
    }
  }

  const pollSubmissionResult = (isAutoSubmit: boolean) => {
    let attempts = 0;
    const intervalId = setInterval(async () => {
      attempts++;
      if (attempts > 30) {
        clearInterval(intervalId);
        setOutput('Polling timed out.');
        setIsRunning(false);
        return;
      }

      try {
        const res = await apiClient.get<any[]>(`/api/coding/assessments/${assessmentId}/submissions`);
        const submissions = res.data || [];
        const mySubmissions = submissions.filter(s => s.questionNo === currentQuestionIndex + 1);
        
        if (mySubmissions.length > 0) {
          // get the latest submission for this question
          const latest = mySubmissions[mySubmissions.length - 1];
          
          if (latest.status === 'PENDING') {
            setOutput('Status: PENDING...');
          } else if (latest.status === 'RUNNING') {
            setOutput('Status: RUNNING...');
          } else {
            // Terminal status
            clearInterval(intervalId);
            setIsRunning(false);
            
            let resultText = `Status: ${latest.status}\n`;
            if (latest.testcasesTotal > 0) {
              resultText += `Testcases Passed: ${latest.testcasesPassed} / ${latest.testcasesTotal}\n`;
            }
            if (latest.executionTimeMs != null) resultText += `Time: ${latest.executionTimeMs} ms\n`;
            if (latest.memoryKb != null) resultText += `Memory: ${latest.memoryKb} KB\n`;
            
            if (latest.compileOutput) resultText += `\nCompiler Output:\n${latest.compileOutput}\n`;
            if (latest.stdout) resultText += `\nStandard Output:\n${latest.stdout}\n`;
            if (latest.stderr) resultText += `\nStandard Error:\n${latest.stderr}\n`;
            
            setOutput(resultText);

            if (isAutoSubmit) {
              handleNextQuestion();
            }
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 1500);
  }

  const handleRunCode = () => {
    executeCode(false);
  }

  const handleSubmitCode = (autoSubmit: boolean = false) => {
    executeCode(autoSubmit);
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setOutput(null)
    } else {
      handleFinishExam()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      setOutput(null)
    }
  }

  if (assessmentResult) {
    return (
      <div className="space-y-6 pb-8 max-w-4xl mx-auto">
        <PageHeader 
          title="Assessment Result" 
          description="Your performance in the coding assessment."
        />
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8 max-w-2xl mx-auto">
          <div className="text-center space-y-4 mb-8">
            <Award className="size-16 text-primary mx-auto" />
            <h2 className="text-3xl font-bold">Score: {assessmentResult.score}%</h2>
            <p className="text-muted-foreground text-lg">
              {assessmentResult.status === 'COMPLETED' ? 'Assessment Completed successfully.' : 'Assessment exited.'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-3xl font-bold">{assessmentResult.totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div className="bg-muted p-4 rounded-lg text-center">
              <div className="text-3xl font-bold">{assessmentResult.submissions?.length || 0}</div>
              <div className="text-sm text-muted-foreground">Submissions Attempted</div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Button onClick={() => {
              setAssessmentResult(null);
              setSelectedDifficulty('Easy');
              setSavedCodes({});
              setCode('');
              setFilteredQuestions([]);
              setAssessmentId(null);
            }}>Back to Practice</Button>
          </div>
        </div>
      </div>
    );
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
                {currentQuestion.examples.map((ex: any, idx: number) => (
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
                {currentQuestion.constraints.map((c: string, idx: number) => (
                  <li key={idx} className="text-sm">{c}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-4 border-t bg-muted/10 flex justify-between">
            <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>Previous</Button>
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex === filteredQuestions.length - 1 ? 'Finish Exam' : 'Next'}
            </Button>
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
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
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
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(val) => {
                setCode(val || '');
                setSavedCodes(prev => ({ ...prev, [currentQuestionIndex]: val || '' }));
              }}
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
