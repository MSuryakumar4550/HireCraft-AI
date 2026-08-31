import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { AuthFormCard } from '@/components/common/AuthFormCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ROUTES } from '@/constants/routes'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const fieldVariants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { delay: 0.35 + i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true)
      await login(data)
      toast.success('Successfully logged in')
      navigate(ROUTES.DASHBOARD)
    } catch (error: any) {
      toast.error(error?.message || 'Failed to login. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md sm:max-w-lg lg:max-w-xl"
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
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Email field */}
          <motion.div
            className="space-y-2.5"
            variants={fieldVariants as any}
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
                className={`h-12 pl-11 text-base transition-shadow duration-200 focus-visible:shadow-md ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </motion.div>

          {/* Password field */}
          <motion.div
            className="space-y-2.5"
            variants={fieldVariants as any}
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
                className={`h-12 pl-11 text-base transition-shadow duration-200 focus-visible:shadow-md ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </motion.div>

          {/* Sign-in button */}
          <motion.div
            variants={fieldVariants as any}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-12 w-full text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </motion.div>
        </form>
      </AuthFormCard>
    </motion.div>
  )
}
