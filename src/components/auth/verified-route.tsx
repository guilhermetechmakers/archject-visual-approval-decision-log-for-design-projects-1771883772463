import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/auth-context'
import { DashboardSkeleton } from '@/components/dashboard'

interface VerifiedRouteProps {
  children: React.ReactNode
}

/**
 * Protects routes that require a verified email (e.g. workspace creation, project actions).
 * Redirects to /auth/verify when authenticated but email not verified.
 */
export function VerifiedRoute({ children }: VerifiedRouteProps) {
  const { isAuthenticated, isLoading, session } = useAuth()
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

  if (!session?.emailVerified) {
    return (
      <Navigate
        to="/auth/verify"
        state={{ from: location, requireVerification: true }}
        replace
      />
    )
  }

  return <>{children}</>
}
