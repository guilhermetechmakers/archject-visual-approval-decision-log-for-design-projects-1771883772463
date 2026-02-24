/**
 * SkeletonTable - Table-like skeleton grid with header and body row placeholders.
 *
 * Matches Card Design spacing and radii.
 * Use during table data fetch.
 *
 * @example
 * <SkeletonTable rows={5} columns={4} withHeader />
 * <SkeletonTable rows={10} columns={3} />
 */

import { cn } from '@/lib/utils'
import { Shimmer } from './shimmer'

export interface SkeletonTableProps {
  /** Number of body rows. Default: 5 */
  rows?: number
  /** Number of columns. Default: 4 */
  columns?: number
  /** Show header row. Default: true */
  withHeader?: boolean
  /** Optional className */
  className?: string
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  withHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-card',
        className
      )}
      role="table"
      aria-label="Loading table"
    >
      {withHeader && (
        <div className="flex border-b border-border bg-muted/50">
          {Array.from({ length: columns }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-1 items-center p-4',
                i > 0 && 'border-l border-border'
              )}
            >
              <Shimmer className="h-4 w-20" aria-hidden />
            </div>
          ))}
        </div>
      )}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex"
            role="row"
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div
                key={colIndex}
                className={cn(
                  'flex flex-1 items-center p-4',
                  colIndex > 0 && 'border-l border-border'
                )}
              >
                <Shimmer
                  className={cn(
                    'h-4',
                    colIndex === 0 ? 'w-32' : 'w-24'
                  )}
                  aria-hidden
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
