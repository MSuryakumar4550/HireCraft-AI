import { useEffect, useState } from 'react'
import { WidgetCard } from '@/components/common/WidgetCard'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brain, Code, Target, Trophy, ArrowRight, Activity, Play } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { apiClient } from '@/services/apiClient'
import { Loader2 } from 'lucide-react'

interface VirtualInterview {
  virtualInterviewId: number
  title: string
  companyContext: string
  roleContext: string
  currentStage: string
  isCompleted: boolean
  overallScore: number | null
}

export function DashboardWidgets() {
  const [interviews, setInterviews] = useState<VirtualInterview[]>([])
  const [readinessScore, setReadinessScore] = useState<number>(0)
  const [codingCount, setCodingCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [interviewsRes, readinessRes, codingRes] = await Promise.all([
          apiClient.get<VirtualInterview[]>('/api/virtual-interviews').catch(() => ({ data: [] })),
          apiClient.get<any>('/api/readiness/current').catch(() => ({ data: null })),
          apiClient.get<any[]>('/api/coding/assessments').catch(() => ({ data: [] }))
        ])
        
        setInterviews(interviewsRes.data || [])
        setReadinessScore(readinessRes.data?.overallPlacementReadiness || 0)
        setCodingCount(codingRes.data?.length || 0)
      } catch (error) {
        console.error('Failed to fetch dashboard data', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Placement Readiness"
          value={`${readinessScore}%`}
          description={readinessScore > 0 ? "Current computed score" : "Not enough data yet"}
          icon={<Target className="size-4" />}
          trend={readinessScore > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Coding Questions"
          value={codingCount.toString()}
          description="Total attempts"
          icon={<Code className="size-4" />}
          trend={codingCount > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Mock Interviews"
          value={interviews.length.toString()}
          description="Total attempts"
          icon={<Activity className="size-4" />}
          trend={interviews.length > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Global Rank"
          value="N/A"
          description="Keep practicing to rank up!"
          icon={<Trophy className="size-4" />}
          trend="neutral"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Virtual Interviews */}
        <WidgetCard title="My Virtual Interviews" icon={<Target className="size-4" />} className="lg:col-span-2">
          <div className="flex h-full flex-col space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground">You haven't started any interviews yet.</p>
                <Button size="sm" asChild>
                  <Link className="gap-2" to={ROUTES.NEW_INTERVIEW || '#'}>Start New Interview <Play className="size-4 ml-2" /></Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map(interview => (
                  <div key={interview.virtualInterviewId} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-medium">{interview.title || 'General Software Engineering'}</p>
                      <p className="text-xs text-muted-foreground">
                        Role: {interview.roleContext || 'N/A'} • Stage: {interview.currentStage}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">Continue</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </WidgetCard>

        {/* AI Insight */}
        <WidgetCard title="AI Insight" icon={<Brain className="size-4" />} className="bg-primary/5 border-primary/20">
          <div className="flex flex-col justify-between h-full space-y-4">
            <p className="text-sm leading-relaxed text-foreground/80">
              {(() => {
                if (interviews.length === 0 && codingCount === 0) {
                  return "Welcome to your dashboard! To get personalized AI insights, start by taking a mock interview or practicing a few coding challenges."
                }
                if (readinessScore > 75) {
                  return "You're on track! Your readiness score is strong. Focus on fine-tuning your behavioral responses to seal the deal."
                }
                if (codingCount > 5 && interviews.length < 2) {
                  return "You've been doing great with coding practice! Let's balance that out by scheduling a mock interview to test your verbal communication skills."
                }
                if (readinessScore < 50 && interviews.length > 0) {
                  return "Your recent interview scores indicate a need for targeted system design practice. I've curated a list of resources to help you bridge the gap."
                }
                return "Consistency is key. Keep up your daily practice streaks and review your AI feedback after each session to maximize your improvement."
              })()}
            </p>
            <Button size="sm" className="w-full gap-2">
              View Practice Plan <ArrowRight className="size-4" />
            </Button>
          </div>
        </WidgetCard>

        {/* Resume Progress */}
        <WidgetCard title="Resume Progress" icon={<Activity className="size-4" />} className="lg:col-span-3">
          <div className="flex flex-col md:flex-row gap-6 items-center h-full">
             <div className="flex-1 space-y-4 w-full">
                <div className="flex justify-between text-sm">
                  <span>ATS Score</span>
                <span className="font-bold text-success">85/100</span>
                </div>
                <Progress value={85} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  Your resume is highly optimized for Software Engineer roles. Consider adding more quantified achievements.
                </p>
                <Button variant="outline" asChild>
                  <Link to={ROUTES.RESUME_ANALYZER}>Analyze Again</Link>
                </Button>
             </div>
          </div>
        </WidgetCard>
      </div>
    </div>
  )
}

