import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthFormCard } from '@/components/common/AuthFormCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/constants/routes'
import { ArrowLeft, Mail, Send } from 'lucide-react'

const fieldVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.35 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function ForgotPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md sm:max-w-lg lg:max-w-xl"
    >
      <AuthFormCard
        title="Reset password"
        description="Enter your email address and we'll send you a secure recovery link to reset your password."
        footer={
          <div className="text-zinc-500">
            <Link
              to={ROUTES.LOGIN}
              className="group flex items-center justify-center gap-2 font-medium text-primary transition-colors duration-200 hover:text-primary/80"
            >
              <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-1" />
              Back to login
            </Link>
          </div>
        }
      >
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <motion.div
            className="space-y-2.5"
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-12 pl-11 text-base transition-shadow duration-200 focus-visible:shadow-md"
              />
            </div>
          </motion.div>

          <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full gap-2 text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <Send className="size-4" />
              Send recovery link
            </Button>
          </motion.div>
        </form>
      </AuthFormCard>
    </motion.div>
  )
}
