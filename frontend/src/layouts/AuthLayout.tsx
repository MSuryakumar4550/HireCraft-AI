import { Outlet, Link } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE } from '@/constants/theme'
import { BRAND_ICON } from '@/constants/navigation'
import { ROUTES } from '@/constants/routes'

export function AuthLayout() {
  const Icon = BRAND_ICON

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Link to={ROUTES.LANDING} className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </div>
          <span className="text-lg font-semibold">{APP_NAME}</span>
        </Link>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">{APP_TAGLINE}</h1>
          <p className="max-w-md text-lg text-sidebar-foreground/65">
            Prepare smarter with personalized AI guidance for resumes, interviews, coding, and
            placement readiness.
          </p>
        </div>
        <p className="text-sm text-sidebar-foreground/45">Trusted by students preparing for top companies.</p>
      </div>

      <div className="flex w-full min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:w-1/2 lg:px-6">
        <Link to={ROUTES.LANDING} className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Icon className="size-4" aria-hidden="true" />
          </div>
          <span className="font-semibold">{APP_NAME}</span>
        </Link>
        <Outlet />
      </div>
    </div>
  )
}
