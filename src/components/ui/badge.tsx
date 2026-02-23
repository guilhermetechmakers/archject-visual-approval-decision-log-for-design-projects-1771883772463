import * as React from 'react'
import { cn } from '@/lib/utils'

const variantStyles: Record<string, string> = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/20 text-primary',
  warning: 'bg-warning/50 text-foreground',
  destructive: 'bg-destructive/20 text-destructive',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-border',
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantStyles
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
