import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Trophy, Award, Zap, ShieldCheck, Flame, Star, Target, 
  Layers, Terminal, Server, CheckCircle2, Lock, Sparkles, Loader2 
} from 'lucide-react'
import { apiClient } from '@/services/apiClient'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface InterviewSession {
  interviewSessionId: number
  subject: string
  status: string
  totalScore: number
  createdAt: string
}

interface ReadinessData {
  overallPlacementReadiness: number
  technicalReadiness: number
  aptitudeReadiness: number
}

interface AchievementBadge {
  id: string
  title: string
  description: string
  category: 'Milestones' | 'Domain Mastery' | 'Excellence'
  icon: any
  color: string
  xp: number
  current: number
  target: number
  unlocked: boolean
  unit?: string
}

export function AchievementsPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [readiness, setReadiness] = useState<ReadinessData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  useEffect(() => {
    const loadAchievementsData = async () => {
      try {
        const [sessionsRes, readinessRes] = await Promise.all([
          apiClient.get<InterviewSession[]>('/api/interviews/sessions').catch(() => ({ data: [] })),
          apiClient.get<ReadinessData>('/api/readiness/current').catch(() => ({ data: null }))
        ])

        setSessions(sessionsRes.data || [])
        setReadiness(readinessRes.data || null)
      } catch (err) {
        console.error('Failed to load achievements data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAchievementsData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Calculating your XP, badges, and unlock progress...</p>
      </div>
    )
  }

  const completed = sessions.filter(s => s.status === 'COMPLETED')
  const completedCount = completed.length
  const bestScore = completed.reduce((max, s) => Math.max(max, s.totalScore || 0), 0)
  const readinessScore = readiness?.overallPlacementReadiness ? Math.round(readiness.overallPlacementReadiness) : 0

  // Helper to check if subject has score >= threshold
  const hasScoreInSubject = (subKeywords: string[], minScore = 70) => {
    return completed.some(s => {
      const sSub = (s.subject || '').toUpperCase()
      const match = subKeywords.some(k => sSub.includes(k.toUpperCase()))
      return match && (s.totalScore || 0) >= minScore
    })
  }

  // Definition of badges
  const badges: AchievementBadge[] = [
    // 1. Milestones
    {
      id: 'first_mock',
      title: 'First Step',
      description: 'Complete your first mock or voice technical interview.',
      category: 'Milestones',
      icon: Flame,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30',
      xp: 200,
      current: Math.min(completedCount, 1),
      target: 1,
      unlocked: completedCount >= 1
    },
    {
      id: 'active_grinder',
      title: 'Active Grinder',
      description: 'Complete 5 full technical or behavioral mock interviews.',
      category: 'Milestones',
      icon: Target,
      color: 'from-blue-500/20 to-cyan-500/20 text-blue-500 border-blue-500/30',
      xp: 500,
      current: Math.min(completedCount, 5),
      target: 5,
      unlocked: completedCount >= 5
    },
    {
      id: 'placement_ready',
      title: 'Placement Ready',
      description: 'Reach 75% or higher on overall placement readiness.',
      category: 'Milestones',
      icon: Trophy,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30',
      xp: 1000,
      current: Math.min(readinessScore, 75),
      target: 75,
      unit: '%',
      unlocked: readinessScore >= 75
    },
    {
      id: 'marathoner',
      title: 'Interview Veteran',
      description: 'Complete 10 mock interviews across any domain.',
      category: 'Milestones',
      icon: Award,
      color: 'from-purple-500/20 to-pink-500/20 text-purple-500 border-purple-500/30',
      xp: 1200,
      current: Math.min(completedCount, 10),
      target: 10,
      unlocked: completedCount >= 10
    },

    // 2. Domain Mastery
    {
      id: 'sys_architect',
      title: 'System Architect',
      description: 'Score 70%+ in a System Design & Architecture interview.',
      category: 'Domain Mastery',
      icon: Server,
      color: 'from-indigo-500/20 to-blue-500/20 text-indigo-500 border-indigo-500/30',
      xp: 400,
      current: hasScoreInSubject(['SYSTEM', 'ARCHITECT']) ? 1 : 0,
      target: 1,
      unlocked: hasScoreInSubject(['SYSTEM', 'ARCHITECT'])
    },
    {
      id: 'jvm_artisan',
      title: 'JVM Artisan',
      description: 'Score 70%+ in a Java & Backend Engineering interview.',
      category: 'Domain Mastery',
      icon: Terminal,
      color: 'from-emerald-500/20 to-green-500/20 text-emerald-500 border-emerald-500/30',
      xp: 400,
      current: hasScoreInSubject(['BACKEND', 'JAVA']) ? 1 : 0,
      target: 1,
      unlocked: hasScoreInSubject(['BACKEND', 'JAVA'])
    },
    {
      id: 'cloud_commander',
      title: 'Cloud Commander',
      description: 'Score 70%+ in Cloud & Infrastructure (DevOps/K8s).',
      category: 'Domain Mastery',
      icon: Layers,
      color: 'from-cyan-500/20 to-sky-500/20 text-cyan-500 border-cyan-500/30',
      xp: 400,
      current: hasScoreInSubject(['CLOUD', 'DEVOPS', 'INFRA']) ? 1 : 0,
      target: 1,
      unlocked: hasScoreInSubject(['CLOUD', 'DEVOPS', 'INFRA'])
    },
    {
      id: 'security_sentinel',
      title: 'Security Sentinel',
      description: 'Score 70%+ in API Security & Design.',
      category: 'Domain Mastery',
      icon: ShieldCheck,
      color: 'from-amber-500/20 to-yellow-500/20 text-amber-500 border-amber-500/30',
      xp: 400,
      current: hasScoreInSubject(['SECUR', 'API']) ? 1 : 0,
      target: 1,
      unlocked: hasScoreInSubject(['SECUR', 'API'])
    },
    {
      id: 'behavioral_star',
      title: 'STAR Storyteller',
      description: 'Score 70%+ in Behavioral & Leadership Competency.',
      category: 'Domain Mastery',
      icon: Star,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-500 border-rose-500/30',
      xp: 400,
      current: hasScoreInSubject(['LEADER', 'TEAM', 'PROBLEM', 'GOAL', 'BEHAVIORAL']) ? 1 : 0,
      target: 1,
      unlocked: hasScoreInSubject(['LEADER', 'TEAM', 'PROBLEM', 'GOAL', 'BEHAVIORAL'])
    },
    {
      id: 'network_ninja',
      title: 'Network Ninja',
      description: 'Score 70%+ in Computer Networks foundational track.',
      category: 'Domain Mastery',
      icon: Zap,
      color: 'from-sky-500/20 to-indigo-500/20 text-sky-500 border-sky-500/30',
      xp: 350,
      current: hasScoreInSubject(['NET', 'CN']) ? 1 : 0,
      target: 1,
      unlocked: hasScoreInSubject(['NET', 'CN'])
    },

    // 3. Excellence
    {
      id: 'high_scorer_80',
      title: 'High Scorer',
      description: 'Achieve an evaluation score of 80% or higher in any interview.',
      category: 'Excellence',
      icon: Sparkles,
      color: 'from-amber-500/20 to-emerald-500/20 text-amber-500 border-amber-500/30',
      xp: 500,
      current: Math.min(bestScore, 80),
      target: 80,
      unit: '%',
      unlocked: bestScore >= 80
    },
    {
      id: 'perfectionist_90',
      title: 'Elite Performer',
      description: 'Achieve an evaluation score of 90% or higher in any interview.',
      category: 'Excellence',
      icon: Trophy,
      color: 'from-rose-500/20 to-purple-500/20 text-rose-500 border-rose-500/30',
      xp: 1500,
      current: Math.min(bestScore, 90),
      target: 90,
      unit: '%',
      unlocked: bestScore >= 90
    }
  ]

  // Calculate total XP and User Level
  const unlockedBadges = badges.filter(b => b.unlocked)
  const baseXP = completedCount * 150
  const badgeXP = unlockedBadges.reduce((acc, b) => acc + b.xp, 0)
  const totalXP = baseXP + badgeXP

  // Rank thresholds
  let level = 1
  let rankTitle = 'Novice Candidate'
  let nextLevelXP = 500
  let currentLevelBaseXP = 0

  if (totalXP >= 4000) {
    level = 5
    rankTitle = 'Elite Placement Master'
    nextLevelXP = 5000
    currentLevelBaseXP = 4000
  } else if (totalXP >= 2500) {
    level = 4
    rankTitle = 'Interview Specialist'
    nextLevelXP = 4000
    currentLevelBaseXP = 2500
  } else if (totalXP >= 1200) {
    level = 3
    rankTitle = 'Consistent Challenger'
    nextLevelXP = 2500
    currentLevelBaseXP = 1200
  } else if (totalXP >= 500) {
    level = 2
    rankTitle = 'Rising Aspirant'
    nextLevelXP = 1200
    currentLevelBaseXP = 500
  }

  const levelProgressPct = Math.min(
    100,
    Math.round(((totalXP - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100)
  )

  const filteredBadges = selectedCategory === 'ALL'
    ? badges
    : badges.filter(b => b.category === selectedCategory)

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <PageHeader 
        title="Achievements & Badges" 
        description="Earn XP, level up your placement rank, and unlock competency trophies through consistent practice."
      />

      {/* Gamified Level Banner */}
      <Card className="border-border/60 shadow-sm bg-gradient-to-r from-card via-card to-primary/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Level & Avatar Badge */}
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20 shrink-0">
                <Trophy className="size-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/40 text-primary font-semibold">
                    LEVEL {level}
                  </Badge>
                  <span className="text-xl font-bold text-foreground">{rankTitle}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {unlockedBadges.length} of {badges.length} Trophies Unlocked • {totalXP} Total Earned XP
                </p>
              </div>
            </div>

            {/* Level XP Progress */}
            <div className="w-full md:w-80 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">Level Progress</span>
                <span className="text-foreground">{totalXP} / {nextLevelXP} XP</span>
              </div>
              <Progress value={levelProgressPct} className="h-2.5" />
              <p className="text-[11px] text-muted-foreground text-right">
                {nextLevelXP - totalXP} XP until Level {level + 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {['ALL', 'Milestones', 'Domain Mastery', 'Excellence'].map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
            className="text-xs h-8"
          >
            {cat === 'ALL' ? 'All Badges' : cat}
          </Button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBadges.map(badge => {
          const Icon = badge.icon
          const pct = Math.min(100, Math.round((badge.current / badge.target) * 100))

          return (
            <Card 
              key={badge.id} 
              className={`border transition-all duration-200 ${
                badge.unlocked 
                  ? 'border-border/80 shadow-sm bg-card hover:shadow-md' 
                  : 'border-border/40 bg-card/40 opacity-75'
              }`}
            >
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  {/* Badge Icon */}
                  <div className={`size-12 rounded-xl border flex items-center justify-center bg-gradient-to-br ${badge.color}`}>
                    <Icon className="size-6" />
                  </div>

                  {/* Status Tag */}
                  {badge.unlocked ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1 text-[11px]">
                      <CheckCircle2 className="size-3" />
                      UNLOCKED
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground border-border/50 gap-1 text-[11px]">
                      <Lock className="size-3" />
                      LOCKED
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-foreground">{badge.title}</h4>
                    <span className="text-xs font-semibold text-primary">+{badge.xp} XP</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {badge.description}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Progress</span>
                    <span>
                      {badge.current}{badge.unit || ''} / {badge.target}{badge.unit || ''}
                    </span>
                  </div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Call to action card */}
      <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-semibold text-sm text-foreground">Want to unlock more trophies faster?</h4>
            <p className="text-xs text-muted-foreground">
              Complete adaptive AI voice interviews and target specialized domain competencies to boost your level.
            </p>
          </div>
          <Link to={ROUTES.AI_VOICE_INTERVIEW}>
            <Button size="sm" className="gap-2 shrink-0">
              <Zap className="size-4" />
              Practice Next Interview
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
