import { Navigate, useLocation } from 'react-router-dom'

/**
 * Redirects /verify to /auth/verify while preserving search params (e.g. ?token=...)
 */
export function VerifyRedirect() {
  const location = useLocation()
  return (
    <Navigate
      to={{ pathname: '/auth/verify', search: location.search }}
      replace
    />
  )
}
