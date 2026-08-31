import { Link } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE } from '@/constants/theme'
import { useExamStore } from '@/stores/examStore'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  collapsed?: boolean
  className?: string
  taglineClassName?: string
}

export function AppLogo({ collapsed, className, taglineClassName }: AppLogoProps) {
  const { isExamActive } = useExamStore()
  
  return (
    <Link
      to="/dashboard"
      onClick={(e) => {
        if (isExamActive) e.preventDefault()
      }}
      className={cn('flex items-center gap-2.5 font-semibold tracking-tight', className)}
      aria-label={`${APP_NAME} home`}
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <img src="/logo.png" alt={`${APP_NAME} logo`} className="size-10 object-cover" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <span className="block truncate text-sm">{APP_NAME}</span>
          <span className={cn('block truncate text-[10px] font-normal', taglineClassName ?? 'text-muted-foreground')}>
            {APP_TAGLINE}
          </span>
        </div>
      )}
    </Link>
  )
}
