import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const variantStyles: Record<string, string> = {
  default:
    'bg-primary text-primary-foreground shadow hover:scale-[1.02] hover:shadow-md active:scale-[0.98]',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-[1.02] active:scale-[0.98]',
  outline:
    'border border-border bg-background hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]',
  ghost: 'hover:bg-secondary hover:scale-[1.02] active:scale-[0.98]',
  link: 'text-primary underline-offset-4 hover:underline',
  destructive:
    'bg-destructive text-white hover:bg-destructive/90 hover:scale-[1.02] active:scale-[0.98]',
}

const sizeStyles: Record<string, string> = {
  default: 'h-10 px-6 py-2.5',
  sm: 'h-8 px-4 py-2 text-xs',
  lg: 'h-12 px-8 py-3 text-base',
  icon: 'h-10 w-10 p-0',
  'icon-sm': 'h-8 w-8 p-0',
  'icon-lg': 'h-12 w-12 p-0',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
