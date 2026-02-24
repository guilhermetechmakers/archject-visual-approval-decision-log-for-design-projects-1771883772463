/**
 * OAuth callback - handles redirect from Google OAuth.
 * Supabase Auth sets the session via URL hash; onAuthStateChange in AuthProvider
 * updates the session. We wait briefly then redirect.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      navigate('/auth/login', { replace: true })
      return
    }

    const redirectTo = searchParams.get('redirect') ?? '/dashboard'

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session) {
          navigate(redirectTo, { replace: true })
        } else {
          setError('Session not found')
          setTimeout(() => navigate('/auth/login', { replace: true }), 2000)
        }
      })
      .catch((err) => {
        setError(err?.message ?? 'Authentication failed')
        setTimeout(() => navigate('/auth/login', { replace: true }), 2000)
      })
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">Redirecting to login…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background" aria-busy="true">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Completing sign in…</p>
    </div>
  )
}
