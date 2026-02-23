import { useSearchParams, Navigate } from 'react-router-dom'
import { ResetPasswordWithTokenPage } from './reset-password-with-token-page'
import { useAuthOptional } from '@/contexts/auth-context'

/**
 * Password reset confirm page - reads token from query param ?token=XYZ
 * Redirects authenticated users to settings (suggest password change there).
 */
export function PasswordResetConfirmPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const auth = useAuthOptional()

  if (auth?.isAuthenticated) {
    return (
      <Navigate
        to="/dashboard/settings"
        replace
        state={{ message: 'Change your password from account settings.' }}
      />
    )
  }

  return (
    <ResetPasswordWithTokenPage token={token ?? ''} />
  )
}
