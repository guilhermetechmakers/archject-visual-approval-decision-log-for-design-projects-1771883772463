import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AuthContainer,
  PasswordResetRequestCard,
  SuccessStateCard,
} from '@/components/auth'
import { authApi, isApiError } from '@/api/auth'
import { toast } from 'sonner'

export function PasswordResetPage() {
  const [submitted, setSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: { email: string }) => {
    setIsLoading(true)
    try {
      await authApi.forgotPassword({ email: data.email })
      setSubmitted(true)
      toast.success('Reset link sent')
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Failed to send reset link')
      } else {
        toast.error('Failed to send reset link')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthContainer
        title="Check your email"
        description="We've sent a password reset link to your email address."
      >
        <SuccessStateCard
          message="If an account with that email exists, a reset link has been sent."
          helperText="Check your inbox and spam folder. The link expires in 60 minutes."
          primaryActionLabel="Back to login"
          primaryActionTo="/auth/login"
          secondaryAction={{ label: 'Sign up', to: '/auth/signup' }}
        />
      </AuthContainer>
    )
  }

  return (
    <AuthContainer
      title="Reset password"
      description="Enter your email and we'll send you a reset link"
    >
      <PasswordResetRequestCard onSubmit={handleSubmit} isLoading={isLoading} />
      <p className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          Back to login
        </Link>
      </p>
    </AuthContainer>
  )
}
