import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { aiMemoryService } from '@/services/aiMemoryService'
import type { AiMemoryItem, AiMemoryHistoryItem } from '@/services/aiMemoryService'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'

export function AIMemoryPage() {
  const [memoryItems, setMemoryItems] = useState<AiMemoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        const response = await aiMemoryService.getMemoryGraph()
        setMemoryItems(response.data)
      } catch (error) {
        console.error("Failed to fetch memory", error)
      } finally {
        setLoading(false)
      }
    }
    fetchMemory()
  }, [])

  if (loading) {
    return <div className="p-12 text-center text-muted-foreground animate-pulse">Loading memory engine...</div>
  }

  if (memoryItems.length === 0) {
    return (
      <div className="space-y-6 pb-8">
        <PageHeader 
          title="AI Memory Engine" 
          description="Your personal knowledge base built from past mock interviews and practice sessions."
        />
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <EmptyState
              icon={<BrainCircuit className="size-12 text-muted-foreground" />}
              title="Memory engine is empty"
              description="Complete mock interviews and practice tests to build your AI memory graph. It will identify your weak spots over time."
              action={<Button>Start a Practice Session</Button>}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      <PageHeader 
        title="AI Memory Engine" 
        description="Your personal knowledge base continuously updating based on your performance."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {memoryItems.map((item) => {
          let history: AiMemoryHistoryItem[] = []
          try {
            history = JSON.parse(item.memoryValue)
          } catch (e) {
            // Fallback for legacy raw string memory values (like "from resume")
            history = [{
              timestamp: new Date().toISOString(),
              score: 100,
              feedback: item.memoryValue
            }]
          }

          const chartData = history.map((h, index) => ({
            name: `Attempt ${index + 1}`,
            score: h.score
          }))

          const latestScore = history.length > 0 ? history[history.length - 1].score : 0
          
          return (
            <Card key={item.memoryId} className="shadow-sm border-muted overflow-hidden">
              <CardHeader className="bg-muted/10 border-b pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2">{item.category}</Badge>
                    <CardTitle className="text-xl">{item.memoryKey}</CardTitle>
                    <CardDescription className="mt-1">
                      Latest Score: <span className="font-semibold text-foreground">{latestScore}/100</span>
                    </CardDescription>
                  </div>
                  {item.memoryType === 'STRENGTH' ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">
                      <TrendingUp className="w-3 h-3 mr-1" /> Core Strength
                    </Badge>
                  ) : item.memoryType === 'WEAKNESS' ? (
                    <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Needs Work
                    </Badge>
                  ) : ['SKILL', 'EXPERIENCE', 'EDUCATION'].includes(item.memoryType) ? (
                    <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">
                      {item.memoryType}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Tracking</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {item.category === 'RESUME' ? (
                  <div className="h-[200px] flex items-start text-sm text-foreground p-4 bg-muted/10 rounded-lg border border-dashed overflow-y-auto whitespace-pre-wrap">
                    {item.memoryValue}
                  </div>
                ) : history.length > 1 ? (
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                        <XAxis 
                          dataKey="name" 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          dy={10}
                        />
                        <YAxis 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke={item.memoryType === 'WEAKNESS' ? '#f43f5e' : '#10b981'} 
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
                    Take another test to see your developing graph!
                  </div>
                )}
                
                {item.category !== 'RESUME' && history.length > 0 && (
                  <div className="mt-4 text-sm text-muted-foreground p-3 bg-muted/20 rounded-md border">
                    <span className="font-semibold text-foreground">Latest AI Insight:</span> {history[history.length - 1].feedback}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
