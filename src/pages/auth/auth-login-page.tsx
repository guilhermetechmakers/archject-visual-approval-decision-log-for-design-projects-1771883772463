import { useState, useEffect } from 'react'
import { useLocation, Navigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
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
        className="flex min-h-[50vh] items-center justify-center"
        role="status"
        aria-busy="true"
        aria-label="Loading authentication"
      >
        <Loader2
          className="h-10 w-10 animate-spin text-primary"
          aria-hidden
        />
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
            <button
              type="button"
              onClick={() => setActiveTab('signup')}
              className="font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              aria-label="Switch to sign up"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className="font-medium text-primary transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              aria-label="Switch to log in"
            >
              Log in
            </button>
          </>
        )}
      </p>
    </AuthContainer>
  )
}
