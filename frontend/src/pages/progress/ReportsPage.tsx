import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { Brain, Code, MessageSquare, TrendingUp, Award, Clock } from 'lucide-react'

const mockPerformanceData = [
  { name: 'Week 1', technical: 65, behavioral: 75, aptitude: 60 },
  { name: 'Week 2', technical: 70, behavioral: 78, aptitude: 68 },
  { name: 'Week 3', technical: 75, behavioral: 82, aptitude: 75 },
  { name: 'Week 4', technical: 85, behavioral: 88, aptitude: 82 },
]

const mockSkillData = [
  { name: 'Algorithms', score: 85 },
  { name: 'System Design', score: 70 },
  { name: 'Communication', score: 92 },
  { name: 'Problem Solving', score: 78 },
  { name: 'Aptitude', score: 82 },
]

export function ReportsPage() {
  return (
    <div className="space-y-6 pb-8">
      <PageHeader 
        title="Performance Reports" 
        description="Detailed analytics of your mock interviews and practice tests."
      />
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-muted shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Award className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">+7% from last week</p>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Interviews Completed</CardTitle>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">3 pending feedback</p>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Practice Hours</CardTitle>
            <Clock className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5h</div>
            <p className="text-xs text-muted-foreground">+2.5h from last week</p>
          </CardContent>
        </Card>
        <Card className="border-muted shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Aptitude Score</CardTitle>
            <Brain className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Top 15% of users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Progression Chart */}
        <Card className="col-span-4 border-muted shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Progression Over Time
            </CardTitle>
            <CardDescription>Your weekly score improvements across different domains</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPerformanceData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBehav" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  />
                  <Area type="monotone" dataKey="technical" name="Technical" stroke="#3b82f6" fillOpacity={1} fill="url(#colorTech)" strokeWidth={2} />
                  <Area type="monotone" dataKey="behavioral" name="Behavioral" stroke="#10b981" fillOpacity={1} fill="url(#colorBehav)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Skill Breakdown Chart */}
        <Card className="col-span-3 border-muted shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="w-5 h-5 mr-2 text-primary" />
              Skill Breakdown
            </CardTitle>
            <CardDescription>Current proficiency across key areas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockSkillData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted" />
                  <XAxis type="number" domain={[0, 100]} className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" className="text-xs text-muted-foreground" tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }}
                  />
                  <Bar dataKey="score" name="Score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
