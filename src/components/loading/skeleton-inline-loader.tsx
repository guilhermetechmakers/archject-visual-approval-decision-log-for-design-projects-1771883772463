/**
 * SkeletonInlineLoader - Inline loading indicator for content blocks.
 *
 * Supports spinner, progress bar, and pulse variants.
 * Use during uploads, exports, or inline content loading.
 *
 * @example
 * <SkeletonInlineLoader type="spinner" size="medium" label="Uploading..." />
 * <SkeletonInlineLoader type="progress" size="large" label="Exporting..." />
 */

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Shimmer } from './shimmer'

export type SkeletonInlineLoaderType = 'spinner' | 'progress' | 'pulse'
export type SkeletonInlineLoaderSize = 'small' | 'medium' | 'large'

export interface SkeletonInlineLoaderProps {
  /** Type of loader: spinner, progress bar, or pulse. Default: spinner */
  type?: SkeletonInlineLoaderType
  /** Size: small, medium, large. Default: medium */
  size?: SkeletonInlineLoaderSize
  /** Optional label for screen readers and display */
  label?: string
  /** Progress value 0-100 (for type="progress"). Default: indeterminate */
  progress?: number
  /** Optional className */
  className?: string
}

const sizeMap: Record<SkeletonInlineLoaderSize, { icon: string; gap: string }> =
  {
    small: { icon: 'h-4 w-4', gap: 'gap-2' },
    medium: { icon: 'h-5 w-5', gap: 'gap-3' },
    large: { icon: 'h-6 w-6', gap: 'gap-4' },
  }

export function SkeletonInlineLoader({
  type = 'spinner',
  size = 'medium',
  label,
  progress,
  className,
}: SkeletonInlineLoaderProps) {
  const { icon, gap } = sizeMap[size]

  if (type === 'spinner') {
    return (
      <div
        className={cn('inline-flex items-center', gap, className)}
        role="status"
        aria-label={label ?? 'Loading'}
      >
        <Loader2 className={cn(icon, 'animate-spin text-primary')} aria-hidden />
        {label && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
      </div>
    )
  }

  if (type === 'progress') {
    const hasValue = progress !== undefined && progress >= 0 && progress <= 100
    return (
      <div
        className={cn('flex flex-col', gap, 'min-w-[160px]', className)}
        role="status"
        aria-live="polite"
        aria-label={label ?? 'Loading'}
      >
        {label && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
        {hasValue ? (
          <div
            className={cn(
              'relative w-full overflow-hidden rounded-full bg-secondary',
              size === 'small' && 'h-1.5',
              size === 'medium' && 'h-2',
              size === 'large' && 'h-2.5'
            )}
          >
            <div
              className="h-full w-full flex-1 bg-warning transition-all duration-300 ease-out"
              style={{
                transform: `translateX(-${100 - (progress ?? 0)}%)`,
              }}
            />
          </div>
        ) : (
          <Shimmer
            className={cn(
              'w-full rounded-full',
              size === 'small' && 'h-1.5',
              size === 'medium' && 'h-2',
              size === 'large' && 'h-2.5'
            )}
          />
        )}
        {hasValue && (
          <span className="text-xs text-muted-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
    )
  }

  if (type === 'pulse') {
    return (
      <div
        className={cn('inline-flex items-center', gap, className)}
        role="status"
        aria-label={label ?? 'Loading'}
      >
        <div
          className={cn(
            'rounded-full bg-primary/30 animate-pulse',
            size === 'small' && 'h-2 w-2',
            size === 'medium' && 'h-3 w-3',
            size === 'large' && 'h-4 w-4'
          )}
          aria-hidden
        />
        {label && (
          <span className="text-sm text-muted-foreground">{label}</span>
        )}
      </div>
    )
  }

  return null
}
