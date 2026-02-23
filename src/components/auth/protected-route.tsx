import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Optional custom loading fallback */
  loadingFallback?: React.ReactNode
  /** Redirect path when unauthenticated */
  redirectTo?: string
  className?: string
}

/**
 * Protects routes that require authentication.
 * - Shows loading skeleton while auth state is being determined
 * - Redirects to login when unauthenticated
 * - Renders children when authenticated
 */
export function ProtectedRoute({
  children,
  loadingFallback,
  redirectTo = '/auth/login',
  className,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    if (loadingFallback) {
      return <>{loadingFallback}</>
    }
    return (
      <div
        className={cn(
          'flex min-h-screen flex-col gap-4 p-4 md:p-6',
          className
        )}
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex h-16 items-center gap-4 border-b border-border">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        state={{ from: location }}
        replace
      />
    )
  }

  return <>{children}</>
}
