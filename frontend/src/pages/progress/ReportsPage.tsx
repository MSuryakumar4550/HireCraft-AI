import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Brain, Code, MessageSquare, TrendingUp, Award, Clock, Printer, FileCheck2, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/services/apiClient'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface InterviewSession {
  interviewSessionId: number
  subject: string
  status: string
  totalScore: number
  durationSeconds?: number
  createdAt: string
  currentTopic?: string
}

interface ReadinessData {
  overallPlacementReadiness: number
  technicalReadiness: number
  aptitudeReadiness: number
  communicationReadiness?: number
  evaluatedSessionsCount?: number
}

interface ReportItem {
  reportId: number
  reportType: string
  overallScore: number
  generatedContent: string
  createdAt: string
}

export function ReportsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [readiness, setReadiness] = useState<ReadinessData | null>(null)
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const [readinessRes, sessionsRes, reportsRes] = await Promise.all([
          apiClient.get<ReadinessData>('/api/readiness/current').catch(() => ({ data: null })),
          apiClient.get<InterviewSession[]>('/api/interviews/sessions').catch(() => ({ data: [] })),
          apiClient.get<ReportItem[]>('/api/reports').catch(() => ({ data: [] }))
        ])

        setReadiness(readinessRes.data || null)
        setSessions(sessionsRes.data || [])
        setReports(reportsRes.data || [])
      } catch (e) {
        console.error('Failed to load performance report data:', e)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Compiling your performance reports & diagnostics...</p>
      </div>
    )
  }

  const completedSessions = sessions.filter(s => s.status === 'COMPLETED')
  const totalInterviews = sessions.length
  const overallReadiness = readiness?.overallPlacementReadiness ? Math.round(readiness.overallPlacementReadiness) : 0
  const technicalReadiness = readiness?.technicalReadiness ? Math.round(readiness.technicalReadiness) : 0
  const aptitudeReadiness = readiness?.aptitudeReadiness ? Math.round(readiness.aptitudeReadiness) : 0

  // Calculate practice duration in hours
  const totalSeconds = completedSessions.reduce((acc, s) => acc + (s.durationSeconds || 600), 0)
  const practiceHours = (totalSeconds / 3600).toFixed(1)

  // Progression Over Time data from actual completed sessions
  const progressionData = completedSessions.length > 0 
    ? [...completedSessions].reverse().map((s, index) => ({
        attempt: `Test ${index + 1}`,
        score: s.totalScore || 0,
        subject: (s.subject || 'Technical').replace(/_/g, ' '),
        date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'
      }))
    : [
        { attempt: 'Start', score: 0, subject: 'Baseline', date: 'Start' }
      ]

  // Dynamic Skill breakdown based on real interview domains
  const subjectScores: Record<string, { total: number; count: number }> = {}
  completedSessions.forEach(s => {
    const rawSub = s.subject || 'Core Technical'
    const name = rawSub.replace(/_/g, ' ')
    if (!subjectScores[name]) subjectScores[name] = { total: 0, count: 0 }
    subjectScores[name].total += s.totalScore || 0
    subjectScores[name].count += 1
  })

  let skillData = Object.entries(subjectScores).map(([name, data]) => ({
    name: name.length > 18 ? name.substring(0, 16) + '...' : name,
    fullName: name,
    score: Math.round(data.total / data.count)
  }))

  if (skillData.length === 0) {
    skillData = [
      { name: 'Core CS', fullName: 'Computer Systems', score: technicalReadiness || 40 },
      { name: 'System Design', fullName: 'System Architecture', score: technicalReadiness ? Math.max(30, technicalReadiness - 10) : 35 },
      { name: 'Aptitude', fullName: 'Quantitative & Logical', score: aptitudeReadiness || 50 },
      { name: 'Behavioral', fullName: 'Behavioral & Leadership', score: 60 }
    ]
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6 pb-8 print:p-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader 
          title="Performance Reports" 
          description="Live diagnostic metrics and longitudinal analytics across your mock interviews and evaluations."
        />
        <div className="flex items-center gap-2 print:hidden">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="size-4" />
            Print Report
          </Button>
          <Link to={ROUTES.PROGRESS}>
            <Button size="sm" className="gap-1.5">
              <TrendingUp className="size-4" />
              Detailed Trajectory
            </Button>
          </Link>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Placement Readiness</CardTitle>
            <Award className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{overallReadiness}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {overallReadiness >= 75 ? 'Ready for Campus Placements' : 'Active Practice in Progress'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
            <MessageSquare className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedSessions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalInterviews} total attempted sessions
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
            <Clock className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{practiceHours}h</div>
            <p className="text-xs text-muted-foreground mt-1">Invested in voice & mock drills</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Technical Benchmark</CardTitle>
            <Brain className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{technicalReadiness}%</div>
            <p className="text-xs text-muted-foreground mt-1">Aptitude: {aptitudeReadiness}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Progression Over Time */}
        <Card className="col-span-4 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <TrendingUp className="size-4 mr-2 text-primary" />
              Score Progression Over Time
            </CardTitle>
            <CardDescription>Longitudinal performance trajectory across consecutive mock interviews</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={progressionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/40" />
                  <XAxis dataKey="attempt" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))', 
                      backgroundColor: 'hsl(var(--card))', 
                      color: 'hsl(var(--card-foreground))' 
                    }}
                    formatter={(value: any, name: any, item: any) => [
                      `${value}% (${item.payload.subject})`,
                      'Score'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="score" 
                    name="Score" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorScore)" 
                    strokeWidth={2.5} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Competency Mastery Breakdown */}
        <Card className="col-span-3 border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-base">
              <Code className="size-4 mr-2 text-primary" />
              Competency Breakdown
            </CardTitle>
            <CardDescription>Evaluated proficiency by technical and behavioral track</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/40" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} width={100} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.4)'}}
                    contentStyle={{ 
                      borderRadius: '8px', 
                      border: '1px solid hsl(var(--border))', 
                      backgroundColor: 'hsl(var(--card))', 
                      color: 'hsl(var(--card-foreground))' 
                    }}
                    formatter={(val: any) => [`${val}%`, 'Proficiency']}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diagnostic Evaluation Reports & History */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileCheck2 className="size-4 text-primary" />
              Generated Performance Diagnostic Reports
            </span>
            <Badge variant="outline" className="text-xs font-normal">
              {completedSessions.length} Evaluated Sessions
            </Badge>
          </CardTitle>
          <CardDescription>
            Detailed evaluations generated by Qwen AI and Gemini during completed interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          {completedSessions.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <AlertCircle className="size-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-medium text-foreground">No completed interviews yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Complete a Voice or Technical Mock Interview to generate your first detailed scorecard and rubric diagnostic report.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <Link to={ROUTES.AI_VOICE_INTERVIEW}>
                  <Button size="sm">Start Voice Interview</Button>
                </Link>
                <Link to={ROUTES.TECHNICAL_INTERVIEW}>
                  <Button size="sm" variant="outline">Technical Mock</Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-border/50 border rounded-lg overflow-hidden">
              {completedSessions.slice(0, 8).map((session, idx) => {
                const score = session.totalScore || 0
                const subject = (session.subject || 'Technical Mock').replace(/_/g, ' ')
                const dateStr = session.createdAt ? new Date(session.createdAt).toLocaleDateString() : 'Recent'

                return (
                  <div key={session.interviewSessionId || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{subject}</span>
                        <Badge 
                          variant="outline" 
                          className={score >= 70 ? 'text-emerald-500 border-emerald-500/30' : score >= 50 ? 'text-amber-500 border-amber-500/30' : 'text-rose-500 border-rose-500/30'}
                        >
                          Score: {score}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Date: {dateStr} • Status: Completed • Session #{session.interviewSessionId}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link to={ROUTES.AI_VOICE_INTERVIEW}>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Retake Track
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
