import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Building2, Target, CheckCircle2, AlertTriangle, ArrowRight, 
  Search, ShieldCheck, Zap, Briefcase, ChevronRight, Loader2, Sparkles 
} from 'lucide-react'
import { apiClient } from '@/services/apiClient'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface ReadinessData {
  overallPlacementReadiness: number
  technicalReadiness: number
  aptitudeReadiness: number
}

interface InterviewSession {
  subject: string
  totalScore: number
  status: string
}

interface CompanyProfile {
  id: string
  name: string
  tier: 'TIER_1' | 'UNICORNS' | 'ENTERPRISE'
  tierLabel: string
  logoColor: string
  packageRange: string
  hiringBarScore: number
  keyFocusAreas: string[]
  rounds: string[]
  description: string
  recommendedTrack: string
}

const COMPANIES: CompanyProfile[] = [
  {
    id: 'google',
    name: 'Google',
    tier: 'TIER_1',
    tierLabel: 'Tier-1 Tech Giant',
    logoColor: 'from-blue-500/20 to-red-500/20 text-blue-500 border-blue-500/30',
    packageRange: '₹35 - ₹65 LPA',
    hiringBarScore: 85,
    keyFocusAreas: ['Complex Data Structures', 'Algorithms', 'Scalable System Design', 'Clean Code'],
    rounds: ['Online Assessment', 'Technical Screening', 'DSA Round 1 & 2', 'System Design', 'Googliness (Behavioral)'],
    description: 'High emphasis on optimal asymptotic complexity, concurrency, and scalable architecture.',
    recommendedTrack: ROUTES.TECHNICAL_INTERVIEW
  },
  {
    id: 'amazon',
    name: 'Amazon',
    tier: 'TIER_1',
    tierLabel: 'Tier-1 Tech Giant',
    logoColor: 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30',
    packageRange: '₹30 - ₹55 LPA',
    hiringBarScore: 80,
    keyFocusAreas: ['Leadership Principles (STAR)', 'Distributed Systems', 'Java / OOP', 'Data Structures'],
    rounds: ['Online Assessment (OA)', 'Technical Interview 1', 'Technical Interview 2', 'System Design & Bar Raiser'],
    description: 'Deep evaluation of 16 Leadership Principles paired with real-world low-level and high-level design.',
    recommendedTrack: ROUTES.BEHAVIORAL_INTERVIEW
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    tier: 'TIER_1',
    tierLabel: 'Tier-1 Tech Giant',
    logoColor: 'from-sky-500/20 to-teal-500/20 text-sky-500 border-sky-500/30',
    packageRange: '₹28 - ₹50 LPA',
    hiringBarScore: 82,
    keyFocusAreas: ['Data Structures & Trees', 'System Architecture', 'Operating Systems', 'Cloud & Azure'],
    rounds: ['Online Coding Test', 'Technical Round 1', 'Technical Round 2 (Design)', 'AA (Advisor) Round'],
    description: 'Evaluates thorough edge-case analysis, operating systems foundations, and maintainable software design.',
    recommendedTrack: ROUTES.TECHNICAL_INTERVIEW
  },
  {
    id: 'atlassian',
    name: 'Atlassian',
    tier: 'UNICORNS',
    tierLabel: 'High-Growth Product',
    logoColor: 'from-blue-600/20 to-indigo-600/20 text-blue-600 border-blue-600/30',
    packageRange: '₹25 - ₹48 LPA',
    hiringBarScore: 80,
    keyFocusAreas: ['Clean Code / OOP', 'System Design & APIs', 'Collaboration & Values', 'Data Structures'],
    rounds: ['Karat Technical Screen', 'Coding & Architecture', 'System Design', 'Values & Leadership'],
    description: 'Known for collaborative pairing interviews, clean code design patterns, and company values.',
    recommendedTrack: ROUTES.AI_VOICE_INTERVIEW
  },
  {
    id: 'uber',
    name: 'Uber',
    tier: 'UNICORNS',
    tierLabel: 'High-Growth Product',
    logoColor: 'from-zinc-500/20 to-neutral-700/20 text-zinc-400 border-zinc-500/30',
    packageRange: '₹32 - ₹58 LPA',
    hiringBarScore: 82,
    keyFocusAreas: ['High-Concurrency Systems', 'Real-Time Streaming', 'Data Structures', 'Microservices'],
    rounds: ['Online Coding Challenge', 'Data Structures Round', 'System Architecture & Concurrency', 'Hiring Manager'],
    description: 'Requires expertise in low-latency systems, message queues, and high-throughput microservices.',
    recommendedTrack: ROUTES.TECHNICAL_INTERVIEW
  },
  {
    id: 'tcs_digital',
    name: 'TCS Digital / Prime',
    tier: 'ENTERPRISE',
    tierLabel: 'Enterprise Digital',
    logoColor: 'from-purple-500/20 to-indigo-500/20 text-purple-500 border-purple-500/30',
    packageRange: '₹7.5 - ₹11.5 LPA',
    hiringBarScore: 68,
    keyFocusAreas: ['Quantitative Aptitude', 'Advanced Coding', 'DBMS & SQL', 'Core Java'],
    rounds: ['National Qualifier Test (NQT)', 'Advanced Coding Test', 'Technical & HR Interview'],
    description: 'Tests foundational aptitude, standard programming puzzles, and core computer science fundamentals.',
    recommendedTrack: ROUTES.APTITUDE
  },
  {
    id: 'infosys_sp',
    name: 'Infosys (Specialist Programmer)',
    tier: 'ENTERPRISE',
    tierLabel: 'Enterprise Digital',
    logoColor: 'from-blue-500/20 to-cyan-500/20 text-blue-500 border-blue-500/30',
    packageRange: '₹8 - ₹12 LPA',
    hiringBarScore: 70,
    keyFocusAreas: ['Advanced Algorithms', 'Dynamic Programming', 'Computer Networks', 'Java'],
    rounds: ['HackWithInfy / InfyTQ Exam', 'Advanced Technical Round', 'HR Round'],
    description: 'Focuses heavily on dynamic programming, graph algorithms, and object-oriented implementation.',
    recommendedTrack: ROUTES.CODING_PRACTICE
  },
  {
    id: 'zoho',
    name: 'Zoho Corporation',
    tier: 'ENTERPRISE',
    tierLabel: 'Product & SaaS',
    logoColor: 'from-rose-500/20 to-red-500/20 text-rose-500 border-rose-500/30',
    packageRange: '₹8 - ₹15 LPA',
    hiringBarScore: 72,
    keyFocusAreas: ['C / Java Implementation', 'Low-Level Design (LLD)', 'Database Design', 'Puzzles'],
    rounds: ['Written Aptitude & Code', 'Basic Programming Round', 'Advanced Programming / LLD', 'Technical & HR'],
    description: 'Emphasizes hands-on coding from scratch without relying on external libraries or frameworks.',
    recommendedTrack: ROUTES.TECHNICAL_INTERVIEW
  }
]

export function CompanyReadinessPage() {
  const [readiness, setReadiness] = useState<ReadinessData | null>(null)
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [tierFilter, setTierFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [readinessRes, sessionsRes] = await Promise.all([
          apiClient.get<ReadinessData>('/api/readiness/current').catch(() => ({ data: null })),
          apiClient.get<InterviewSession[]>('/api/interviews/sessions').catch(() => ({ data: [] }))
        ])
        setReadiness(readinessRes.data || null)
        setSessions(sessionsRes.data || [])
      } catch (err) {
        console.error('Failed to load company readiness data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Analyzing your benchmark readiness against top tech hiring bars...</p>
      </div>
    )
  }

  const userReadinessScore = readiness?.overallPlacementReadiness 
    ? Math.round(readiness.overallPlacementReadiness) 
    : 0

  // Filter companies
  const filteredCompanies = COMPANIES.filter(c => {
    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.keyFocusAreas.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesTier && matchesSearch
  })

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <PageHeader 
        title="Company Readiness & Match" 
        description="Compare your current evaluated placement readiness against typical hiring bars and test patterns of top tech recruiters."
      />

      {/* User Readiness Summary Card */}
      <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary">
                  YOUR CURRENT STANDING
                </Badge>
                <span className="text-xl font-bold text-foreground">{userReadinessScore}% Placement Readiness</span>
              </div>
              <p className="text-xs text-muted-foreground max-w-xl">
                Calculated from your technical mock interviews, voice assessments, and aptitude practice scores.
                Compare this baseline against the hiring bar of your dream companies below.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link to={ROUTES.AI_VOICE_INTERVIEW}>
                <Button size="sm" className="gap-1.5 shrink-0">
                  <Zap className="size-4" />
                  Boost Score
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Tier Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: 'All Companies' },
            { id: 'TIER_1', label: 'Tier-1 FAANG' },
            { id: 'UNICORNS', label: 'Unicorns' },
            { id: 'ENTERPRISE', label: 'IT & Digital' }
          ].map(t => (
            <Button
              key={t.id}
              variant={tierFilter === t.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTierFilter(t.id)}
              className="text-xs h-8"
            >
              {t.label}
            </Button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input 
            placeholder="Search company or skill..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {filteredCompanies.map(company => {
          // Calculate Match Score %
          // If hiringBar is 80 and user is 60 -> match is min(100, round((60 / 80) * 100)) = 75%
          const matchPct = Math.min(100, Math.round((userReadinessScore / company.hiringBarScore) * 100))
          const isReady = userReadinessScore >= company.hiringBarScore
          const isClose = !isReady && matchPct >= 75
          const gapPoints = Math.max(0, company.hiringBarScore - userReadinessScore)

          return (
            <Card key={company.id} className="border-border/60 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 space-y-5">
                {/* Top Row: Company Name & Tier */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`size-12 rounded-xl border flex items-center justify-center font-bold text-base bg-gradient-to-br ${company.logoColor}`}>
                      {company.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-base text-foreground">{company.name}</h4>
                      <p className="text-xs text-muted-foreground">{company.tierLabel} • Est. {company.packageRange}</p>
                    </div>
                  </div>

                  {/* Match Badge */}
                  {isReady ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1 text-xs">
                      <CheckCircle2 className="size-3" />
                      Ready to Clear
                    </Badge>
                  ) : isClose ? (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1 text-xs">
                      <AlertTriangle className="size-3" />
                      Close ({matchPct}%)
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-muted text-muted-foreground border-border/50 text-xs">
                      {matchPct}% Match
                    </Badge>
                  )}
                </div>

                {/* Match Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Benchmark Readiness Match</span>
                    <span className="font-semibold text-foreground">
                      {userReadinessScore}% / {company.hiringBarScore}% Cutoff
                    </span>
                  </div>
                  <Progress value={matchPct} className="h-2" />
                </div>

                {/* Gap Analysis Summary */}
                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <span className="font-medium text-foreground">Hiring Bar Analysis:</span>
                  <p className="text-muted-foreground">
                    {isReady 
                      ? `Your current overall readiness (${userReadinessScore}%) meets or exceeds ${company.name}'s typical threshold (${company.hiringBarScore}%). You are in a strong position for technical screenings.` 
                      : `You are ${gapPoints}% below ${company.name}'s target bar (${company.hiringBarScore}%). Recommended: Focus on ${company.keyFocusAreas.slice(0, 2).join(' & ')}.`}
                  </p>
                </div>

                {/* Key Focus Areas */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Core Technical Syllabus
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {company.keyFocusAreas.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-[11px] font-normal py-0.5">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 flex items-center justify-between border-t border-border/40">
                  <span className="text-[11px] text-muted-foreground">
                    {company.rounds.length} Interview Rounds
                  </span>
                  <Link to={company.recommendedTrack}>
                    <Button size="sm" variant="outline" className="text-xs gap-1.5 h-8">
                      Target Practice
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
