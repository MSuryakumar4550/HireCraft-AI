import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Bot, Brain, Check, Code2, Target } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/constants/routes'
import { BRAND_ICON } from '@/constants/navigation'
import { APP_NAME } from '@/constants/theme'

const features = [
  { title: 'Resume workspace', description: 'Bring structure to the resume review process and keep the next improvement visible.', icon: Bot },
  { title: 'Interview practice', description: 'A focused space for technical and behavioural interview preparation.', icon: Brain },
  { title: 'Coding preparation', description: 'Track the work that builds confidence for coding assessments.', icon: Code2 },
  { title: 'Readiness planning', description: 'Organise company-specific preparation into a clear, sustainable plan.', icon: Target },
]

const faqs = [
  ['What can I do in HireCraft AI today?', 'You can use the workspace to organise your preparation, track progress, and explore each focused practice area. Intelligent services will connect to these foundations in future releases.'],
  ['Is this a replacement for my college placement cell?', 'No. HireCraft AI is designed to complement the resources and guidance offered by your institution.'],
  ['Can I customise the workspace?', 'Yes. Choose light, dark, system, or AMOLED themes, select an accent colour, and adjust your display density and motion preferences.'],
]

export function LandingPage() {
  const Icon = BRAND_ICON

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to={ROUTES.LANDING} className="flex items-center gap-2 font-semibold" aria-label="HireCraft AI home">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Icon className="size-4" /></span>
            {APP_NAME}
          </Link>
          <nav aria-label="Marketing navigation" className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground">Platform</a>
            <a href="#how-it-works" className="hover:text-foreground">How it works</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link to={ROUTES.LOGIN}>Sign in</Link></Button>
            <Button asChild><Link to={ROUTES.REGISTER}>Get started <ArrowRight className="ml-2 size-4" /></Link></Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Badge variant="secondary" className="mb-4 font-medium">Your personal placement mentor</Badge>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">{APP_NAME}</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Preparation, with a clearer next step.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">{APP_NAME} brings your resume, technical practice, interview preparation, and placement plan into one calm workspace.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild><Link to={ROUTES.REGISTER}>Create your workspace <ArrowRight className="ml-2 size-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link to={ROUTES.LOGIN}>Explore the platform</Link></Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {['Focused, distraction-free workspace', 'Built for placement preparation', 'Your preferences, remembered'].map((item) => <span key={item} className="flex items-center gap-2"><Check className="size-4 text-primary" />{item}</span>)}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-2xl border bg-card p-5 shadow-2xl shadow-primary/5 sm:p-7">
            <div className="flex items-center justify-between border-b pb-4"><div><p className="text-sm font-medium">Today&apos;s focus</p><p className="mt-1 text-xs text-muted-foreground">A practical view of your preparation</p></div><Badge>In progress</Badge></div>
            <div className="mt-5 space-y-3">{['Review your resume foundations', 'Continue coding practice', 'Plan a mock interview'].map((item, index) => <div key={item} className="flex items-center gap-3 rounded-lg border p-4"><span className="grid size-7 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{index + 1}</span><span className="text-sm font-medium">{item}</span></div>)}</div>
            <div className="mt-5 rounded-lg bg-muted p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Placement readiness</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-background"><div className="h-full w-1/2 rounded-full bg-primary" /></div><p className="mt-2 text-sm text-muted-foreground">Your dashboard turns preparation into a steady habit.</p></div>
          </motion.div>
        </section>

        <section id="features" className="border-y bg-muted/30"><div className="mx-auto max-w-7xl px-4 py-20 sm:px-6"><div className="max-w-2xl"><p className="text-sm font-medium text-primary">One connected workspace</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">The tools around your placement journey.</h2><p className="mt-4 text-muted-foreground">Every area has a dedicated, consistent interface—ready to grow with your preparation.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(({ title, description, icon: FeatureIcon }) => <Card key={title} className="transition-shadow hover:shadow-md"><CardContent className="p-6"><span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><FeatureIcon className="size-5" /></span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p></CardContent></Card>)}</div></div></section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6"><div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-sm font-medium text-primary">A simple rhythm</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Start with where you are.</h2></div><div className="grid gap-6 sm:grid-cols-3">{[['01', 'Set your direction', 'Tell the workspace what you want to prepare for.'], ['02', 'Build a routine', 'Use focused modules to make consistent progress.'], ['03', 'See what matters', 'Keep your next priorities and milestones in view.']].map(([number, title, copy]) => <div key={number} className="border-l pl-5"><span className="text-sm font-medium text-primary">{number}</span><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p></div>)}</div></div></section>

        <section id="faq" className="border-t bg-muted/30"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[.8fr_1.2fr]"><div><p className="text-sm font-medium text-primary">Questions</p><h2 className="mt-3 text-3xl font-semibold tracking-tight">Built for a considered start.</h2><p className="mt-4 text-muted-foreground">The platform is intentionally structured as a reliable foundation for your placement preparation.</p></div><Accordion type="single" collapsible className="w-full">{faqs.map(([question, answer], index) => <AccordionItem key={question} value={`faq-${index}`}><AccordionTrigger>{question}</AccordionTrigger><AccordionContent className="leading-6 text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6"><div className="rounded-2xl bg-zinc-950 px-6 py-12 text-white sm:px-12"><p className="text-sm font-medium text-zinc-400">HireCraft AI</p><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">Make your next placement step feel obvious.</h2><Button className="mt-7 bg-white text-zinc-950 hover:bg-zinc-200" asChild><Link to={ROUTES.REGISTER}>Begin your preparation <ArrowRight className="ml-2 size-4" /></Link></Button></div></section>
      </main>
      <footer className="border-t"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6"><span className="font-medium text-foreground">{APP_NAME}</span><span>© {new Date().getFullYear()} HireCraft AI. All rights reserved.</span></div></footer>
    </div>
  )
}
