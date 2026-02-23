import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AuthContainer,
  AuthTabs,
  EmailAuthForm,
  GoogleOAuthButton,
  SecurityHintsPanel,
  EmailVerificationBanner,
} from '@/components/auth'
import type { AuthTabValue } from '@/components/auth'
import { useAuth } from '@/contexts/auth-context'
import { isApiError } from '@/api/auth'
import type {
  LoginFormData,
  SignupFormData,
} from '@/components/auth/email-auth-form'

export function AuthLoginPage() {
  const { login, register } = useAuth()
  const { pathname } = useLocation()
  const initialTab: AuthTabValue = pathname.includes('signup') ? 'signup' : 'login'
  const [activeTab, setActiveTab] = useState<AuthTabValue>(initialTab)

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])
  const [isLoading, setIsLoading] = useState(false)
  const [signupEmail, setSignupEmail] = useState<string | null>(null)
  const [requiresVerification, setRequiresVerification] = useState(false)

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      await login(data.email, data.password, data.rememberMe)
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Sign in failed')
      } else {
        toast.error('Sign in failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (data: SignupFormData) => {
    setIsLoading(true)
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
        toast.success('Account created')
      }
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Sign up failed')
      } else {
        toast.error('Sign up failed')
      }
    } finally {
      setIsLoading(false)
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
        isLoading={isLoading}
      />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <GoogleOAuthButton mode="login" disabled={isLoading} />
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
        isLoading={isLoading}
      />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>
      <GoogleOAuthButton mode="signup" disabled={isLoading} />
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
              className="text-primary hover:underline font-medium"
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
              className="text-primary hover:underline font-medium"
            >
              Log in
            </button>
          </>
        )}
      </p>
    </AuthContainer>
  )
}
