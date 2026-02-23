import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AuthContainer,
  PasswordResetFormCard,
  SuccessStateCard,
} from '@/components/auth'
import { Button } from '@/components/ui/button'
import { authApi, isApiError } from '@/api/auth'
import { toast } from 'sonner'

export interface ResetPasswordWithTokenPageProps {
  token: string
}

export function ResetPasswordWithTokenPage({ token }: ResetPasswordWithTokenPageProps) {
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)

  const handleSubmit = async (data: {
    newPassword: string
    confirmPassword: string
  }) => {
    if (!token) {
      setTokenError('Invalid reset link')
      return
    }
    setIsLoading(true)
    setTokenError(null)
    try {
      await authApi.resetPassword({
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      setSuccess(true)
      toast.success('Password reset successfully')
    } catch (e) {
      if (isApiError(e)) {
        const msg = e.message ?? 'Failed to reset password'
        setTokenError(msg)
        toast.error(msg)
      } else {
        toast.error('Failed to reset password')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <AuthContainer
        title="Password reset"
        description="Your password has been updated successfully."
      >
        <SuccessStateCard
          message="Your password has been updated successfully."
          helperText="You can now sign in with your new password."
          primaryActionLabel="Sign in"
          primaryActionTo="/auth/login"
          secondaryAction={{ label: 'Sign up', to: '/auth/signup' }}
        />
      </AuthContainer>
    )
  }

  if (!token) {
    return (
      <AuthContainer
        title="Invalid link"
        description="This password reset link is invalid or has expired."
      >
        <Link to="/auth/password-reset">
          <Button className="w-full">Request new link</Button>
        </Link>
      </AuthContainer>
    )
  }

  return (
    <AuthContainer
      title="Set new password"
      description="Enter your new password below"
    >
      <PasswordResetFormCard
        token={token}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={tokenError ?? undefined}
        tokenValid={!tokenError}
      />
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
