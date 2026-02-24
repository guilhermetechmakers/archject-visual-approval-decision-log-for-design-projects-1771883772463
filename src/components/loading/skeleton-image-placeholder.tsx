/**
 * SkeletonImagePlaceholder - Placeholder block mimicking image or media thumbnail.
 *
 * Use for image galleries, media cards, or any image loading state.
 *
 * @example
 * <SkeletonImagePlaceholder aspectRatio="16/9" />
 * <SkeletonImagePlaceholder width={200} height={150} />
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Shimmer } from './shimmer'

export interface SkeletonImagePlaceholderProps {
  /** Width in pixels (optional if aspectRatio used) */
  width?: number | string
  /** Height in pixels (optional if aspectRatio used) */
  height?: number | string
  /** Aspect ratio (e.g. "16/9", "1", "4/3"). Takes precedence over width/height for sizing */
  aspectRatio?: string
  /** Optional className */
  className?: string
}

export function SkeletonImagePlaceholder({
  width,
  height,
  aspectRatio,
  className,
}: SkeletonImagePlaceholderProps) {
  const style: React.CSSProperties = {}
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height
  if (aspectRatio !== undefined) style.aspectRatio = aspectRatio

  return (
    <Shimmer
      className={cn(
        'block w-full',
        !width && !height && !aspectRatio && 'aspect-video',
        className
      )}
      style={Object.keys(style).length > 0 ? style : undefined}
      role="img"
      aria-label="Loading image"
      aria-hidden={false}
    />
  )
}
