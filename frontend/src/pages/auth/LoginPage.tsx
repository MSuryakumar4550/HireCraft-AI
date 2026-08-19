import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthFormCard } from '@/components/common/AuthFormCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/constants/routes'
import { Mail, Lock } from 'lucide-react'

const fieldVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.35 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

export function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <AuthFormCard
        title="Welcome back"
        description="Enter your credentials to access your account"
        footer={
          <div className="text-zinc-500">
            Don't have an account?{' '}
            <Link
              to={ROUTES.REGISTER}
              className="font-medium text-primary transition-colors duration-200 hover:text-primary/80 hover:underline"
            >
              Sign up
            </Link>
          </div>
        }
      >
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          {/* Email field */}
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

          {/* Password field */}
          <motion.div
            className="space-y-2.5"
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground/60" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-12 pl-11 text-base transition-shadow duration-200 focus-visible:shadow-md"
              />
            </div>
          </motion.div>

          {/* Sign-in button */}
          <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              asChild
            >
              <Link to={ROUTES.DASHBOARD}>Sign in</Link>
            </Button>
          </motion.div>

          {/* Divider */}
          <motion.div
            className="relative py-1"
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card/80 px-3 text-muted-foreground">Or continue with</span>
            </div>
          </motion.div>

          {/* Google button */}
          <motion.div
            variants={fieldVariants}
            initial="hidden"
            animate="visible"
            custom={4}
          >
            <Button
              variant="outline"
              type="button"
              size="lg"
              className="h-12 w-full gap-3 text-base font-medium shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg className="size-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>
          </motion.div>
        </form>
      </AuthFormCard>
    </motion.div>
  )
}
