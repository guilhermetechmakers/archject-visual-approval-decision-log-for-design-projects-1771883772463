import { useParams } from 'react-router-dom'
import { ResetPasswordWithTokenPage } from './reset-password-with-token-page'

/**
 * Route wrapper that reads token from URL params and passes to ResetPasswordWithTokenPage.
 * Used for /auth/reset-password/:token
 */
export function ResetPasswordRoute() {
  const { token } = useParams<{ token: string }>()
  return <ResetPasswordWithTokenPage token={token ?? ''} />
}
