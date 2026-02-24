import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { setAuthTokenGetter } from '@/lib/api'
import { getAccessTokenSync } from '@/lib/auth-service'

export function RootLayout() {
  useEffect(() => {
    setAuthTokenGetter(getAccessTokenSync)
  }, [])

  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  )
}
