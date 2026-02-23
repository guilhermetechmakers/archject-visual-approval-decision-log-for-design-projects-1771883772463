import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VerificationStatus = 'success' | 'error' | 'neutral' | 'verifying'

export interface StatusIconProps {
  status: VerificationStatus
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
}

export function StatusIcon({
  status,
  className,
  size = 'md',
}: StatusIconProps) {
  const sizeClass = sizeClasses[size]

  if (status === 'verifying') {
    return (
      <Loader2
        className={cn(sizeClass, 'animate-spin text-primary', className)}
        aria-hidden
      />
    )
  }

  if (status === 'success') {
    return (
      <CheckCircle
        className={cn(sizeClass, 'text-success shrink-0', className)}
        aria-hidden
      />
    )
  }

  if (status === 'error') {
    return (
      <AlertCircle
        className={cn(sizeClass, 'text-destructive shrink-0', className)}
        aria-hidden
      />
    )
  }

  return (
    <AlertCircle
      className={cn(sizeClass, 'text-muted-foreground shrink-0', className)}
      aria-hidden
    />
  )
}
