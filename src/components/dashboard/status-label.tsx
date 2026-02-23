import { cn } from '@/lib/utils'

export type StatusLabelVariant = 'pending' | 'overdue' | 'success' | 'warning' | 'secondary'

const variantStyles: Record<StatusLabelVariant, string> = {
  pending: 'bg-warning/50 text-foreground',
  overdue: 'bg-destructive/20 text-destructive',
  success: 'bg-success/20 text-primary',
  warning: 'bg-warning-muted/60 text-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
}

export interface StatusLabelProps {
  variant?: StatusLabelVariant
  children: React.ReactNode
  className?: string
}

export function StatusLabel({
  variant = 'secondary',
  children,
  className,
}: StatusLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
