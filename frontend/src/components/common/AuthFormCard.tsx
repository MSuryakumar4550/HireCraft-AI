import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthFormCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

export function AuthFormCard({ title, description, children, footer, className }: AuthFormCardProps) {
  return (
    <div className="relative w-full max-w-[calc(100vw-2rem)] sm:max-w-xl md:max-w-2xl lg:max-w-[92%]">
      {/* Animated gradient glow behind the card */}
      <div
        className="pointer-events-none absolute -inset-px rounded-[calc(var(--radius-feature)+1px)] opacity-60 blur-sm"
        style={{
          background:
            'conic-gradient(from var(--auth-glow-angle, 0deg), hsl(var(--primary) / 0.35), hsl(var(--ring) / 0.15), hsl(var(--primary) / 0.35))',
          animation: 'auth-glow-spin 6s linear infinite',
        }}
      />

      <Card
        className={cn(
          'relative w-full border border-border/60 bg-card/80 shadow-lg backdrop-blur-xl',
          'rounded-[var(--radius-feature)]',
          className,
        )}
      >
        <motion.div variants={stagger} initial="hidden" animate="visible">
          <CardHeader className="space-y-2 px-6 pt-8 pb-2 md:px-10 md:pt-10 lg:px-12 lg:pt-12">
            <motion.div variants={fadeUp}>
              <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
            </motion.div>
            {description && (
              <motion.div variants={fadeUp}>
                <CardDescription className="text-[0.95rem] leading-relaxed text-muted-foreground/80">
                  {description}
                </CardDescription>
              </motion.div>
            )}
          </CardHeader>

          <motion.div variants={fadeUp}>
            <CardContent className="space-y-5 px-6 pt-4 pb-6 md:space-y-6 md:px-10 md:pb-8 lg:px-12 lg:pb-10">{children}</CardContent>
          </motion.div>

          {footer && (
            <motion.div variants={fadeUp}>
              <div className="border-t border-border/50 px-6 py-4 text-center text-sm md:px-10 md:py-5 lg:px-12 lg:py-6">{footer}</div>
            </motion.div>
          )}
        </motion.div>
      </Card>
    </div>
  )
}
