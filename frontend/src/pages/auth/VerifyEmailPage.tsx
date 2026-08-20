import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthFormCard } from '@/components/common/AuthFormCard'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants/routes'
import { CheckCircle2 } from 'lucide-react'

export function VerifyEmailPage() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <AuthFormCard
        title="Check your email"
        description="We've sent a verification link to your email address."
        className="text-center"
      >
        <div className="flex flex-col items-center space-y-4 py-4">
          <div className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="size-8" />
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in the email to verify your account. If you don't see it, check your spam folder.
          </p>
          <Button type="button" variant="outline" className="w-full">
            Resend email
          </Button>
          <Button type="button" className="w-full" asChild>
            <Link to={ROUTES.LOGIN}>Back to login</Link>
          </Button>
        </div>
      </AuthFormCard>
    </motion.div>
  )
}
