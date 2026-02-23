import { Navigate, useLocation } from 'react-router-dom'
import { useAuthOptional } from '@/contexts/auth-context'

export interface PasswordResetGuardProps {
  children: React.ReactNode
}

/**
 * Route guard: redirect authenticated users away from password reset flows.
 * If logged in, suggest changing password from account settings.
 */
export function PasswordResetGuard({ children }: PasswordResetGuardProps) {
  const auth = useAuthOptional()
  const location = useLocation()

  if (auth?.isAuthenticated) {
    return (
      <Navigate
        to="/dashboard/settings"
        replace
        state={{
          from: location.pathname,
          message: 'You are already signed in. Change your password from account settings.',
        }}
      />
    )
  }

  return <>{children}</>
}
