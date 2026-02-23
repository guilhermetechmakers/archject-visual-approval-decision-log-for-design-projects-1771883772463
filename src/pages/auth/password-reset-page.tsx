import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthContainer } from '@/components/auth'
import { authApi, isApiError } from '@/api/auth'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Invalid email'),
})

type FormData = z.infer<typeof schema>

export function PasswordResetPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await authApi.forgotPassword({ email: data.email })
      setSubmittedEmail(data.email)
      setSubmitted(true)
      toast.success('Reset link sent')
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Failed to send reset link')
      } else {
        toast.error('Failed to send reset link')
      }
    }
  }

  if (submitted) {
    return (
      <AuthContainer
        title="Check your email"
        description="We've sent a password reset link to your email address."
      >
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
            <CheckCircle className="h-8 w-8 shrink-0 text-success" />
            <div>
              <p className="font-medium text-foreground">Email sent</p>
              <p className="text-sm text-muted-foreground">
                If an account exists for <strong>{submittedEmail}</strong>, you
                will receive a password reset link. Check your spam folder if you
                don&apos;t see it.
              </p>
            </div>
          </div>
          <Link to="/auth/login">
            <Button className="w-full">Back to login</Button>
          </Link>
        </div>
      </AuthContainer>
    )
  }

  return (
    <AuthContainer
      title="Reset password"
      description="Enter your email and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
          <Mail className="h-6 w-6 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Enter the email address associated with your account. We&apos;ll send
            a secure link to reset your password.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@studio.com"
            autoComplete="email"
            {...register('email')}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full">
          Send reset link
        </Button>
        <p className="text-center">
          <Link
            to="/auth/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Back to login
          </Link>
        </p>
      </form>
    </AuthContainer>
  )
}
