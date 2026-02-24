/**
 * OAuth callback - handles redirect from Google OAuth.
 * Supabase Auth sets the session via URL hash; onAuthStateChange in AuthProvider
 * updates the session. We wait briefly then redirect.
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
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
      <div
        className="flex min-h-screen flex-col bg-gradient-to-br from-secondary/30 via-background to-accent/5"
        role="main"
        aria-labelledby="auth-callback-error-title"
      >
        <div className="flex flex-1 items-center justify-center px-4 py-12 lg:py-16">
          <div className="w-full max-w-md space-y-6">
            <Card className="rounded-2xl border-border shadow-card overflow-hidden">
              <CardHeader className="pb-2">
                <h1
                  id="auth-callback-error-title"
                  className="text-xl font-semibold text-foreground sm:text-2xl"
                >
                  Sign in incomplete
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Something went wrong during authentication.
                </p>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                <Alert variant="destructive" role="alert" className="rounded-lg">
                  <AlertCircle className="h-4 w-4" aria-hidden />
                  <AlertTitle>Authentication error</AlertTitle>
                  <AlertDescription className="text-destructive">
                    {error}
                  </AlertDescription>
                </Alert>
                <p
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Redirecting to login…
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => navigate('/auth/login', { replace: true })}
                  aria-label="Go to login now"
                >
                  Go to login
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex min-h-screen flex-col bg-gradient-to-br from-secondary/30 via-background to-accent/5"
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-atomic="true"
      aria-label="Completing sign in"
    >
      <div className="flex flex-1 items-center justify-center px-4 py-12 lg:py-16">
        <div className="w-full max-w-md">
          <Card className="rounded-2xl border-border shadow-card overflow-hidden">
            <CardHeader className="pb-2">
              <h1 className="sr-only">Completing sign in</h1>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-6 py-12">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"
                aria-hidden
              >
                <Loader2
                  className="h-6 w-6 animate-spin"
                  aria-hidden
                />
              </div>
              <div className="space-y-2 text-center">
                <p
                  className="text-base font-medium text-foreground"
                  id="auth-callback-status"
                >
                  Completing sign in…
                </p>
                <p className="text-sm text-muted-foreground">
                  Please wait while we finish setting up your session.
                </p>
              </div>
              <div
                className="h-2 w-24 animate-pulse rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={undefined}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Loading"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
