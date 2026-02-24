/**
 * SkeletonList - Vertical list of skeleton rows mimicking data list items.
 *
 * Renders avatar, title line, secondary line, and optional trailing actions.
 * Use during list data fetch.
 *
 * @example
 * <SkeletonList items={5} avatar showActions />
 * <SkeletonList items={3} rowHeight="h-16" />
 */

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Shimmer } from './shimmer'

export interface SkeletonListProps {
  /** Number of skeleton rows, or array of configs for varied rows */
  items?: number | Array<{ avatar?: boolean; showActions?: boolean }>
  /** Row height. Default: h-16 */
  rowHeight?: string | number
  /** Show avatar/thumbnail placeholder. Default: true */
  avatar?: boolean
  /** Show trailing actions placeholder. Default: false */
  showActions?: boolean
  /** Optional className */
  className?: string
}

export function SkeletonList({
  items = 5,
  rowHeight = 'h-16',
  avatar = true,
  showActions = false,
  className,
}: SkeletonListProps) {
  const count = Array.isArray(items) ? items.length : items
  const configs = Array.isArray(items)
    ? items
    : Array.from({ length: count }, () => ({ avatar, showActions }))

  const rowStyle: React.CSSProperties =
    typeof rowHeight === 'number' ? { minHeight: `${rowHeight}px` } : {}

  return (
    <ul
      className={cn('flex flex-col gap-4', className)}
      role="list"
      aria-label="Loading content"
    >
      {configs.map((config, i) => (
        <li
          key={i}
          className={cn(
            'flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card',
            typeof rowHeight === 'string' && rowHeight
          )}
          style={rowStyle}
        >
          {config.avatar !== false && (
            <Shimmer
              className="h-10 w-10 shrink-0 rounded-full"
              aria-hidden
            />
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <Shimmer className="h-4 w-3/4 max-w-[200px]" aria-hidden />
            <Shimmer className="h-3 w-1/2 max-w-[120px]" aria-hidden />
          </div>
          {config.showActions && (
            <div className="flex shrink-0 gap-2">
              <Shimmer className="h-8 w-8 rounded-md" aria-hidden />
              <Shimmer className="h-8 w-8 rounded-md" aria-hidden />
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}
