/**
 * AdminRoleRoute - Protects admin routes; requires authenticated user with admin role.
 * Redirects non-admin users to dashboard.
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { DashboardSkeleton } from '@/components/dashboard'

interface AdminRoleRouteProps {
  children: React.ReactNode
}

export function AdminRoleRoute({ children }: AdminRoleRouteProps) {
  const { isAdmin, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="w-full max-w-4xl px-4">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
