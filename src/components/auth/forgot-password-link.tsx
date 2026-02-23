import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface ForgotPasswordLinkProps {
  className?: string
}

export function ForgotPasswordLink({ className }: ForgotPasswordLinkProps) {
  return (
    <Link
      to="/auth/password-reset"
      className={cn(
        'text-sm text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
        className
      )}
      aria-label="Forgot password? Reset it here"
    >
      Forgot password?
    </Link>
  )
}
