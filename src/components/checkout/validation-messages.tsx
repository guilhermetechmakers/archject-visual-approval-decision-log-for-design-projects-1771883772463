import { cn } from '@/lib/utils'

export type ValidationStatus = 'error' | 'warning' | 'success' | 'helper'

export interface ValidationMessagesProps {
  id?: string
  status?: ValidationStatus
  message?: string
  className?: string
}

const statusStyles: Record<ValidationStatus, string> = {
  error: 'text-destructive',
  warning: 'text-warning-muted',
  success: 'text-success',
  helper: 'text-muted-foreground',
}

export function ValidationMessages({
  id,
  status = 'helper',
  message,
  className,
}: ValidationMessagesProps) {
  if (!message) return null

  return (
    <p
      id={id}
      className={cn(
        'mt-1.5 text-sm',
        statusStyles[status],
        className
      )}
      role={status === 'error' ? 'alert' : undefined}
    >
      {message}
    </p>
  )
}
