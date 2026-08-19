import { WidgetCard } from '@/components/common/WidgetCard'
import { StatCard } from '@/components/common/StatCard'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Brain, Code, Target, Trophy, ArrowRight, Calendar, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function DashboardWidgets() {
  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Placement Readiness"
          value="72%"
          description="+4% from last week"
          icon={<Target className="size-4" />}
          trend="up"
        />
        <StatCard
          title="Coding Questions"
          value="143"
          description="12 solved this week"
          icon={<Code className="size-4" />}
          trend="up"
        />
        <StatCard
          title="Mock Interviews"
          value="5"
          description="Next: Tomorrow, 10 AM"
          icon={<Activity className="size-4" />}
          trend="neutral"
        />
        <StatCard
          title="Global Rank"
          value="4,291"
          description="Top 15% of users"
          icon={<Trophy className="size-4" />}
          trend="up"
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Today's Goal */}
        <WidgetCard title="Today's Goal" icon={<Target className="size-4" />} className="lg:col-span-2">
          <div className="flex h-full flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">Complete Daily DSA Challenge</p>
                  <p className="text-sm text-muted-foreground">Arrays & Hashing</p>
                </div>
                <span className="text-sm font-medium">0/3</span>
              </div>
              <Progress value={0} className="h-2" />
              
              <div className="flex items-center justify-between pt-4">
                <div className="space-y-1">
                  <p className="font-medium">Update Resume</p>
                  <p className="text-sm text-muted-foreground">Add new project</p>
                </div>
                <Button size="sm" variant="outline">Start</Button>
              </div>
            </div>
          </div>
        </WidgetCard>

        {/* AI Insight */}
        <WidgetCard title="AI Insight" icon={<Brain className="size-4" />} className="bg-primary/5 border-primary/20">
          <div className="flex flex-col justify-between h-full space-y-4">
            <p className="text-sm leading-relaxed text-foreground/80">
              Your performance in <strong>System Design</strong> has improved, but you're struggling with <strong>Dynamic Programming</strong>. 
              I've scheduled a focused practice session for you today.
            </p>
            <Button size="sm" className="w-full gap-2">
              View Practice Plan <ArrowRight className="size-4" />
            </Button>
          </div>
        </WidgetCard>

        {/* Upcoming Schedule */}
        <WidgetCard title="Upcoming Schedule" icon={<Calendar className="size-4" />} className="lg:col-span-1">
           <div className="space-y-4">
            {[
              { title: 'Amazon Mock Interview', time: 'Tomorrow, 10:00 AM', type: 'Technical' },
              { title: 'Aptitude Test', time: 'Thursday, 4:00 PM', type: 'Assessment' },
              { title: 'Resume Review', time: 'Friday, 11:30 AM', type: 'Mentorship' }
            ].map((event, i) => (
              <div key={i} className="flex flex-col gap-1 border-l-2 border-primary pl-3">
                <span className="text-sm font-medium">{event.title}</span>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{event.time}</span>
                  <span className="rounded-full bg-secondary px-2 py-0.5">{event.type}</span>
                </div>
              </div>
            ))}
           </div>
        </WidgetCard>

        {/* Resume Progress */}
        <WidgetCard title="Resume Progress" icon={<Activity className="size-4" />} className="lg:col-span-2">
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
