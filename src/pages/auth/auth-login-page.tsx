import { useState, useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AuthContainer,
  AuthTabs,
  EmailAuthForm,
  GoogleOAuthButton,
  SecurityHintsPanel,
  EmailVerificationBanner,
  EnterpriseSSOPanel,
} from '@/components/auth'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import type { AuthTabValue } from '@/components/auth'
import { useAuth } from '@/contexts/auth-context'
import { isApiError } from '@/api/auth'
import type {
  LoginFormData,
  SignupFormData,
} from '@/components/auth/email-auth-form'

export function AuthLoginPage() {
  const { login, register, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { pathname, state } = useLocation()
  const initialTab: AuthTabValue = pathname.includes('signup') ? 'signup' : 'login'
  const [activeTab, setActiveTab] = useState<AuthTabValue>(initialTab)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [signupEmail, setSignupEmail] = useState<string | null>(null)
  const [requiresVerification, setRequiresVerification] = useState(false)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  if (isAuthLoading) {
    return (
      <div
        className="flex min-h-screen flex-col bg-gradient-to-br from-secondary/30 via-background to-accent/5"
        role="status"
        aria-busy="true"
        aria-label="Loading authentication"
      >
        <div className="flex-1 flex items-center justify-center px-4 py-12 lg:py-16">
          <div className="w-full max-w-md space-y-8">
            <Skeleton className="h-8 w-32 rounded-pill" />
            <Card className="shadow-card border-border rounded-2xl overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true)
    try {
      const redirectTo =
        (state as { from?: { pathname?: string } } | null)?.from?.pathname ??
        '/dashboard'
      await login(data.email, data.password, data.rememberMe, redirectTo)
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Sign in failed. Please check your email and password.')
      } else {
        toast.error('Sign in failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignup = async (data: SignupFormData) => {
    setIsSubmitting(true)
    try {
      const result = await register({
        email: data.email,
        password: data.password,
        workspaceName: data.workspaceName,
        agreeToTerms: data.agreeToTerms,
      })
      setSignupEmail(data.email)
      setRequiresVerification(result.requiresEmailVerification)
      if (!result.requiresEmailVerification) {
        toast.success('Account created! Redirecting to dashboard…')
      }
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Sign up failed. Please try again.')
      } else {
        toast.error('Sign up failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAuthSubmit = async (data: LoginFormData | SignupFormData) => {
    if ('confirmPassword' in data) {
      await handleSignup(data)
    } else {
      await handleLogin(data)
    }
  }

  const loginContent = (
    <div className="space-y-6">
      <EmailAuthForm
        mode="login"
        onSubmit={handleAuthSubmit}
        isLoading={isSubmitting}
      />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <GoogleOAuthButton mode="login" disabled={isSubmitting} />
      <div className="mt-4">
        <EnterpriseSSOPanel />
      </div>
    </div>
  )

  const signupContent = (
    <div className="space-y-6">
      {requiresVerification && signupEmail && (
        <EmailVerificationBanner email={signupEmail} verified={false} />
      )}
      <EmailAuthForm
        mode="signup"
        onSubmit={handleAuthSubmit}
        isLoading={isSubmitting}
      />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <GoogleOAuthButton mode="signup" disabled={isSubmitting} />
      <div className="mt-4">
        <EnterpriseSSOPanel />
      </div>
      <SecurityHintsPanel />
    </div>
  )

  return (
    <AuthContainer
      title={activeTab === 'login' ? 'Welcome back' : 'Create your account'}
      description={
        activeTab === 'login'
          ? 'Sign in to your account'
          : 'Get started with a free workspace'
      }
    >
      <AuthTabs
        value={activeTab}
        onValueChange={setActiveTab}
        loginContent={loginContent}
        signupContent={signupContent}
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {activeTab === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <Button
              type="button"
              variant="link"
              onClick={() => setActiveTab('signup')}
              className="h-auto p-0 font-medium"
              aria-label="Switch to sign up"
            >
              Sign up
            </Button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <Button
              type="button"
              variant="link"
              onClick={() => setActiveTab('login')}
              className="h-auto p-0 font-medium"
              aria-label="Switch to log in"
            >
              Log in
            </Button>
          </>
        )}
      </p>
    </AuthContainer>
  )
}
