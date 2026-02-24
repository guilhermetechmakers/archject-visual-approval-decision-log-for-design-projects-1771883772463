/**
 * Shimmer - Low-level utility for shimmer animation used by skeleton components.
 * Configurable gradient, duration, and direction.
 * Uses Archject design tokens: muted (#F7F8FA), border (#E6E8F0).
 *
 * @example
 * <Shimmer className="h-4 w-32 rounded" />
 * <Shimmer duration={2} direction="rtl" className="h-8 w-full" />
 */

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional custom gradient for shimmer (default uses design tokens) */
  gradient?: string
  /** Animation duration in seconds. Default: 1.5 */
  duration?: number
  /** Gradient direction: ltr (left-to-right) or rtl (right-to-left). Default: ltr */
  direction?: 'ltr' | 'rtl'
  /** Whether to respect prefers-reduced-motion. Default: true */
  reduceMotion?: boolean
}

const Shimmer = React.forwardRef<HTMLDivElement, ShimmerProps>(
  (
    {
      className,
      gradient,
      duration = 1.5,
      direction = 'ltr',
      reduceMotion = true,
      style,
      ...props
    },
    ref
  ) => {
    const defaultGradient =
      'linear-gradient(90deg, rgb(247 248 250) 0%, rgb(230 232 240) 50%, rgb(247 248 250) 100%)'
    return (
      <div
        ref={ref}
        role="img"
        aria-hidden
        className={cn(
          'overflow-hidden rounded-md bg-muted',
          reduceMotion && 'motion-reduce:animate-none',
          className
        )}
        style={{
          ...style,
          background: gradient ?? defaultGradient,
          backgroundSize: '200% 100%',
          animation: `shimmer ${duration}s ease-in-out infinite`,
          animationDirection: direction === 'rtl' ? 'reverse' : 'normal',
        }}
        {...props}
      />
    )
  }
)
Shimmer.displayName = 'Shimmer'

export { Shimmer }
