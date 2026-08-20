import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { ROUTES } from '@/constants/routes'
import { getNavItemByPath } from '@/constants/navigation'

export function AppBreadcrumbs() {
  const { pathname } = useLocation()
  const navItem = getNavItemByPath(pathname)

  if (pathname === ROUTES.DASHBOARD) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={ROUTES.DASHBOARD} className="flex items-center gap-1">
              <Home className="size-3.5" aria-hidden="true" />
              Dashboard
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {navItem && navItem.showBreadcrumb !== false && (
          <>
            <BreadcrumbSeparator>
              <ChevronRight className="size-3.5" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{navItem.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
