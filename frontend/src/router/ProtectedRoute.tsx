import { Navigate, Outlet } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface ProtectedRouteProps {
  requireAuth?: boolean
}

export function ProtectedRoute({ requireAuth = false }: ProtectedRouteProps) {
  // Placeholder: always allow access until backend auth is integrated
  const isAuthenticated = !requireAuth || true

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  return <Outlet />
}
