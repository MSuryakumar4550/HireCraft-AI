import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  CalendarDays, CheckCircle2, Circle, Clock, Flame, 
  BookOpen, Terminal, Server, MessageSquare, ArrowRight, RotateCcw, Sparkles 
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface StudyPhase {
  id: string
  title: string
  subtitle: string
  weekRange: string
  icon: any
  color: string
  tasks: { id: string; title: string; duration: string; route?: string }[]
}

const DEFAULT_SPRINT_PHASES: StudyPhase[] = [
  {
    id: 'phase_1',
    title: 'Phase 1: CS Foundations & Aptitude Drill',
    subtitle: 'Core computer science theory and online screening test clearance',
    weekRange: 'Weeks 1 - 2',
    icon: BookOpen,
    color: 'from-blue-500/20 to-cyan-500/20 text-blue-500 border-blue-500/30',
    tasks: [
      { id: 'p1_1', title: 'Operating Systems: Process Synchronization, Deadlocks, & Paging', duration: '3 hrs', route: ROUTES.AI_VOICE_INTERVIEW },
      { id: 'p1_2', title: 'DBMS: ACID Transactions, Indexing (B-Trees), & Normalization', duration: '3 hrs', route: ROUTES.AI_VOICE_INTERVIEW },
      { id: 'p1_3', title: 'Computer Networks: OSI Model, TCP vs UDP, & DNS Resolution', duration: '2.5 hrs', route: ROUTES.AI_VOICE_INTERVIEW },
      { id: 'p1_4', title: 'Aptitude Practice: Time & Work, Speed & Distance, Probability', duration: '2 hrs', route: ROUTES.APTITUDE }
    ]
  },
  {
    id: 'phase_2',
    title: 'Phase 2: Java Backend & Data Structures',
    subtitle: 'High-frequency programming interview topics and JVM internals',
    weekRange: 'Weeks 3 - 4',
    icon: Terminal,
    color: 'from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/30',
    tasks: [
      { id: 'p2_1', title: 'JVM Internals: Heap vs Stack, Garbage Collection (G1/ZGC), & Metaspace', duration: '3 hrs', route: ROUTES.TECHNICAL_INTERVIEW },
      { id: 'p2_2', title: 'Java Concurrency: ReentrantLocks, Volatile, & Virtual Threads', duration: '3.5 hrs', route: ROUTES.TECHNICAL_INTERVIEW },
      { id: 'p2_3', title: 'Spring Boot: Dependency Injection, JPA Query Optimization & N+1 Problem', duration: '3 hrs', route: ROUTES.TECHNICAL_INTERVIEW },
      { id: 'p2_4', title: 'Coding Practice: Two Pointers, Sliding Window, & Dynamic Programming', duration: '4 hrs', route: ROUTES.CODING_PRACTICE }
    ]
  },
  {
    id: 'phase_3',
    title: 'Phase 3: System Design & Cloud Infrastructure',
    subtitle: 'Large-scale distributed systems and cloud deployment patterns',
    weekRange: 'Weeks 5 - 6',
    icon: Server,
    color: 'from-indigo-500/20 to-purple-500/20 text-indigo-500 border-indigo-500/30',
    tasks: [
      { id: 'p3_1', title: 'Scalability & Load Balancing: Consistent Hashing, L4 vs L7, Caching (Redis)', duration: '4 hrs', route: ROUTES.AI_VOICE_INTERVIEW },
      { id: 'p3_2', title: 'Event-Driven Systems: Message Queues (Kafka vs RabbitMQ), Saga Pattern', duration: '3.5 hrs', route: ROUTES.AI_VOICE_INTERVIEW },
      { id: 'p3_3', title: 'Docker & Kubernetes: Multi-stage Builds, Pods, Deployments & HPA', duration: '3 hrs', route: ROUTES.TECHNICAL_INTERVIEW },
      { id: 'p3_4', title: 'API Security: OAuth2/JWT Tokens, Rate Limiting, & OWASP Top 10', duration: '2.5 hrs', route: ROUTES.TECHNICAL_INTERVIEW }
    ]
  },
  {
    id: 'phase_4',
    title: 'Phase 4: Mock Marathon & Behavioral STAR',
    subtitle: 'High-stakes voice interviews, leadership principles, and bar-raiser drills',
    weekRange: 'Weeks 7 - 8',
    icon: MessageSquare,
    color: 'from-amber-500/20 to-rose-500/20 text-amber-500 border-amber-500/30',
    tasks: [
      { id: 'p4_1', title: 'Behavioral STAR: Leadership & Driving High-Stakes Project Milestones', duration: '2 hrs', route: ROUTES.BEHAVIORAL_INTERVIEW },
      { id: 'p4_2', title: 'Conflict Resolution: Navigating Disagreements & High-Pressure Crises', duration: '2 hrs', route: ROUTES.BEHAVIORAL_INTERVIEW },
      { id: 'p4_3', title: 'End-to-End Technical Voice Mock: Full 5-Question Evaluation with Qwen & Gemini', duration: '2.5 hrs', route: ROUTES.AI_VOICE_INTERVIEW },
      { id: 'p4_4', title: 'Review Weak Topics in AI Memory & Retake Sub-70% Scorecards', duration: '2 hrs', route: ROUTES.PROGRESS }
    ]
  }
]

export function StudyPlannerPage() {
  const [sprintDuration, setSprintDuration] = useState<'30' | '60' | '90'>('60')
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})
  const [targetDate, setTargetDate] = useState<string>(() => {
    const saved = localStorage.getItem('hirecraft_target_date')
    if (saved) return saved
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 60)
    return defaultDate.toISOString().split('T')[0]
  })

  // Load completed tasks from localStorage
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem('hirecraft_study_plan_tasks')
      if (savedTasks) {
        setCompletedTasks(JSON.parse(savedTasks))
      }
    } catch {}
  }, [])

  // Toggle task
  const toggleTask = (taskId: string) => {
    const updated = { ...completedTasks, [taskId]: !completedTasks[taskId] }
    setCompletedTasks(updated)
    localStorage.setItem('hirecraft_study_plan_tasks', JSON.stringify(updated))
  }

  // Handle target date change
  const handleDateChange = (newDate: string) => {
    setTargetDate(newDate)
    localStorage.setItem('hirecraft_target_date', newDate)
  }

  // Calculate days remaining
  const daysRemaining = Math.max(
    0,
    Math.ceil((new Date(targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  )

  // Calculate completion percentage
  const allTasks = DEFAULT_SPRINT_PHASES.flatMap(p => p.tasks)
  const totalTasksCount = allTasks.length
  const finishedCount = allTasks.filter(t => completedTasks[t.id]).length
  const progressPct = Math.round((finishedCount / totalTasksCount) * 100)

  const handleResetChecklist = () => {
    if (window.confirm('Reset all checklist progress?')) {
      setCompletedTasks({})
      localStorage.removeItem('hirecraft_study_plan_tasks')
    }
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <PageHeader 
        title="Placement Study Planner" 
        description="Your structured, milestone-driven preparation schedule to clear campus drives and technical interview bars."
      />

      {/* Countdown & Sprint Banner */}
      <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card via-card to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Countdown Display */}
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex flex-col items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                <span className="text-2xl font-bold leading-none">{daysRemaining}</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider mt-1">Days</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary font-semibold">
                    TARGET COUNTDOWN
                  </Badge>
                  <span className="text-lg font-bold text-foreground">Until Placement Season</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Drive Date:</span>
                  <input 
                    type="date" 
                    value={targetDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="bg-muted px-2 py-0.5 rounded border border-border text-foreground text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Overall Sprint Completion */}
            <div className="w-full md:w-80 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Curriculum Completion</span>
                <span className="text-foreground">{finishedCount} / {totalTasksCount} Tasks ({progressPct}%)</span>
              </div>
              <Progress value={progressPct} className="h-2.5" />
              <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                <span>{sprintDuration}-Day Placement Sprint</span>
                <button onClick={handleResetChecklist} className="hover:underline flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <RotateCcw className="size-3" /> Reset
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sprint Length Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1">Sprint Plan:</span>
          {[
            { id: '30', label: '30-Day Fast Track' },
            { id: '60', label: '60-Day Standard (Recommended)' },
            { id: '90', label: '90-Day Comprehensive' }
          ].map(s => (
            <Button
              key={s.id}
              variant={sprintDuration === s.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSprintDuration(s.id as any)}
              className="text-xs h-8"
            >
              {s.label}
            </Button>
          ))}
        </div>

        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs py-1">
          <Sparkles className="size-3 mr-1" />
          Recommended: 1 Voice Mock Interview Every 48 Hours
        </Badge>
      </div>

      {/* 4-Phase Timeline Roadmap */}
      <div className="space-y-6">
        {DEFAULT_SPRINT_PHASES.map((phase, pIdx) => {
          const Icon = phase.icon
          const phaseTasks = phase.tasks
          const phaseCompleted = phaseTasks.filter(t => completedTasks[t.id]).length
          const phasePct = Math.round((phaseCompleted / phaseTasks.length) * 100)

          return (
            <Card key={phase.id} className="border-border/60 shadow-sm overflow-hidden">
              {/* Phase Header */}
              <div className="bg-muted/30 border-b border-border/50 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`size-10 rounded-xl border flex items-center justify-center bg-gradient-to-br ${phase.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground">{phase.title}</h4>
                      <Badge variant="secondary" className="text-[10px] font-normal py-0">
                        {phase.weekRange}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{phase.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-medium text-foreground">{phaseCompleted} / {phaseTasks.length}</span>
                    <p className="text-[10px] text-muted-foreground">Milestones</p>
                  </div>
                  <div className="w-20 sm:w-24">
                    <Progress value={phasePct} className="h-1.5" />
                  </div>
                </div>
              </div>

              {/* Task Checklist Items */}
              <CardContent className="p-0 divide-y divide-border/40">
                {phaseTasks.map(task => {
                  const isDone = Boolean(completedTasks[task.id])

                  return (
                    <div 
                      key={task.id} 
                      className={`p-4 sm:px-6 flex items-center justify-between gap-4 transition-colors ${
                        isDone ? 'bg-muted/10' : 'hover:bg-muted/20'
                      }`}
                    >
                      {/* Checkbox & Title */}
                      <div 
                        onClick={() => toggleTask(task.id)}
                        className="flex items-start sm:items-center gap-3 cursor-pointer select-none flex-1"
                      >
                        {isDone ? (
                          <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
                        ) : (
                          <Circle className="size-5 text-muted-foreground/60 hover:text-primary transition-colors shrink-0 mt-0.5 sm:mt-0" />
                        )}
                        <div>
                          <p className={`text-xs sm:text-sm font-medium transition-colors ${
                            isDone ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}>
                            {task.title}
                          </p>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-3" /> Est. {task.duration}
                          </span>
                        </div>
                      </div>

                      {/* Direct Action Link */}
                      {task.route && (
                        <Link to={task.route}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs gap-1 text-muted-foreground hover:text-foreground h-8 px-2"
                          >
                            Practice
                            <ArrowRight className="size-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
