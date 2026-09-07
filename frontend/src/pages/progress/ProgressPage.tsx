import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { apiClient } from '@/services/apiClient'
import { aiMemoryService } from '@/services/aiMemoryService'
import type { AiMemoryItem, AiMemoryHistoryItem } from '@/services/aiMemoryService'
import { ROUTES } from '@/constants/routes'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Award, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Activity, 
  Loader2, 
  Play, 
  Calendar 
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface InterviewSession {
  interviewSessionId: number
  interviewType: string
  subject?: string
  status: string
  totalQuestions?: number
  totalScore?: number | null
  createdAt?: string
}

interface ReadinessData {
  overallPlacementReadiness?: number
  technicalReadiness?: number
  aptitudeReadiness?: number
  communicationReadiness?: number
}

export function ProgressPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [memoryItems, setMemoryItems] = useState<AiMemoryItem[]>([])
  const [readiness, setReadiness] = useState<ReadinessData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const [sessionsRes, memoryRes, readinessRes] = await Promise.all([
          apiClient.get<InterviewSession[]>('/api/interviews/sessions').catch(() => ({ data: [] })),
          aiMemoryService.getMemoryGraph().catch(() => ({ data: [] })),
          apiClient.get<ReadinessData>('/api/readiness/current').catch(() => ({ data: null }))
        ])

        setSessions(sessionsRes.data || [])
        setMemoryItems(memoryRes.data || [])
        setReadiness(readinessRes.data || null)
      } catch (err) {
        console.error('Failed to load progress data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProgressData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading learning progress and performance analytics...</p>
      </div>
    )
  }

  const completedSessions = sessions.filter(s => s.status === 'COMPLETED')
  const totalSessionsCount = sessions.length
  const bestScore = completedSessions.reduce((max, s) => Math.max(max, s.totalScore || 0), 0)
  const readinessScore = readiness?.overallPlacementReadiness || 0

  // Chart data: chronological performance trajectory across all attempts
  const progressionData = [...completedSessions]
    .reverse()
    .map((s, index) => ({
      attempt: `Attempt ${index + 1}`,
      score: s.totalScore || 0,
      subject: (s.subject || 'Technical').replace(/_/g, ' '),
      date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'
    }))

  // Subject breakdown data
  const subjectScores: Record<string, { total: number; count: number }> = {}
  completedSessions.forEach(s => {
    const sub = (s.subject || 'Technical').replace(/_/g, ' ')
    if (!subjectScores[sub]) subjectScores[sub] = { total: 0, count: 0 }
    subjectScores[sub].total += s.totalScore || 0
    subjectScores[sub].count += 1
  })

  const subjectChartData = Object.entries(subjectScores).map(([subject, data]) => ({
    subject,
    avgScore: Math.round(data.total / data.count),
    attempts: data.count
  }))

  const strengths = memoryItems.filter(m => m.memoryType === 'STRENGTH')
  const weaknesses = memoryItems.filter(m => m.memoryType === 'WEAKNESS')

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Learning Progress & Analytics" 
        description="Comprehensive trajectory of your adaptive technical mock interviews, domain scores, and AI-identified growth areas."
      />

      {/* KPI Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Interviews Attempted</CardTitle>
            <Activity className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSessionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedSessions.length} completed evaluation scorecards
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Placement Readiness</CardTitle>
            <Target className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{readinessScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {readinessScore >= 70 ? 'Interview Ready' : readinessScore > 0 ? 'Foundations Underway' : 'Awaiting evaluations'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Highest Technical Score</CardTitle>
            <Award className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{bestScore}/100</div>
            <p className="text-xs text-muted-foreground mt-1">Personal best across all tracks</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Focus Areas</CardTitle>
            <Brain className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{weaknesses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Targeted review topics identified</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      {completedSessions.length === 0 ? (
        <Card className="shadow-sm border-dashed">
          <CardContent className="pt-8 pb-8">
            <EmptyState
              icon={<TrendingUp className="size-12 text-muted-foreground" />}
              title="No completed interviews yet"
              description="Complete an AI Voice Interview to visualize your learning progression trajectory, adaptive difficulty trends, and subject mastery graphs."
              action={
                <Button asChild>
                  <Link to={ROUTES.AI_VOICE_INTERVIEW}>Start AI Voice Interview <Play className="size-4 ml-2" /></Link>
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Progression Chart */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                <CardTitle className="text-lg">Score Progression Over Time</CardTitle>
              </div>
              <CardDescription>
                Chronological score trajectory across consecutive mock interviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressionData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="attempt" className="text-xs text-muted-foreground" tickLine={false} />
                    <YAxis domain={[0, 100]} className="text-xs text-muted-foreground" tickLine={false} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1">
                              <p className="font-semibold text-foreground">{d.attempt} • {d.subject}</p>
                              <p className="text-primary font-bold">Score: {d.score}/100</p>
                              <p className="text-muted-foreground">{d.date}</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Subject Mastery Breakdown */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="size-5 text-emerald-500" />
                <CardTitle className="text-lg">Subject Mastery Breakdown</CardTitle>
              </div>
              <CardDescription>
                Average score achieved per Core Computer Science track
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectChartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                    <XAxis dataKey="subject" className="text-xs text-muted-foreground" tickLine={false} />
                    <YAxis domain={[0, 100]} className="text-xs text-muted-foreground" tickLine={false} />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-md text-xs space-y-1">
                              <p className="font-semibold text-foreground">{d.subject}</p>
                              <p className="text-emerald-600 font-bold">Average Score: {d.avgScore}/100</p>
                              <p className="text-muted-foreground">{d.attempts} interview attempts</p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="avgScore" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Memory Insights: Strengths & Weaknesses Grid */}
      {memoryItems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">AI Memory Engine Insights</h3>
              <p className="text-sm text-muted-foreground">Dynamic knowledge graph built from live interview rubric evaluations</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to={ROUTES.AI_MEMORY}>View Full Knowledge Graph</Link>
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Core Strengths */}
            <Card className="shadow-sm border-emerald-500/20 bg-emerald-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-emerald-600" />
                  <CardTitle className="text-base text-emerald-900 dark:text-emerald-300">Identified Strengths</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {strengths.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Continue practicing to identify your core technical strengths.</p>
                ) : (
                  strengths.slice(0, 4).map(item => (
                    <div key={item.memoryId} className="flex items-center justify-between bg-background/80 rounded-lg p-2.5 border">
                      <span className="font-medium text-sm text-foreground">{item.memoryKey}</span>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Solid Mastery</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Growth Areas */}
            <Card className="shadow-sm border-rose-500/20 bg-rose-500/5">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-rose-600" />
                  <CardTitle className="text-base text-rose-900 dark:text-rose-300">Priority Revision Topics</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {weaknesses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No weak spots currently flagged by AI evaluator.</p>
                ) : (
                  weaknesses.slice(0, 4).map(item => (
                    <div key={item.memoryId} className="flex items-center justify-between bg-background/80 rounded-lg p-2.5 border">
                      <span className="font-medium text-sm text-foreground">{item.memoryKey}</span>
                      <Badge className="bg-rose-500/10 text-rose-600 border-rose-200">Needs Work</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Comprehensive Session History Table */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Interview & Practice History</CardTitle>
              <CardDescription>Detailed audit of all sessions conducted in HireCraft AI</CardDescription>
            </div>
            <Button size="sm" asChild>
              <Link to={ROUTES.AI_VOICE_INTERVIEW}>New Session <Play className="size-4 ml-1" /></Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No sessions on record yet.</div>
          ) : (
            <div className="divide-y">
              {sessions.map(s => (
                <div key={s.interviewSessionId} className="flex flex-wrap items-center justify-between py-3.5 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">
                        {(s.subject || 'Technical').replace(/_/g, ' ')} Technical Mock Interview
                      </p>
                      <Badge variant={s.status === 'COMPLETED' ? 'default' : 'secondary'} className="text-[10px]">
                        {s.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Recent'}
                      </span>
                      <span>•</span>
                      <span>{s.totalQuestions || 4} Questions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground">Score</span>
                      <p className={`font-bold text-base ${
                        s.totalScore !== null && s.totalScore >= 70 ? 'text-emerald-600' :
                        s.totalScore !== null && s.totalScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {s.totalScore !== null ? `${s.totalScore}/100` : 'In Progress'}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={ROUTES.AI_VOICE_INTERVIEW}>Practice Again</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
