/**
 * SkeletonCard - Card-styled skeleton with header, body lines, and optional footer.
 *
 * Matches Card Design: white background, shadows, 12-16px radius, ≥24px padding.
 * Use in content sections awaiting data.
 *
 * @example
 * <SkeletonCard hasHeader hasFooter lines={[0.9, 0.6, 0.4]} />
 * <SkeletonCard hasHeader lines={[1, 1, 0.8]} />
 * <SkeletonCard lines={[{ width: 1, height: 4 }, { width: 0.8, height: 4 }]} />
 */

import { Shimmer } from './shimmer'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

export interface SkeletonCardLine {
  /** Width as fraction 0-1. Default: 1 */
  width?: number
  /** Height in rem units (e.g. 4 = 1rem). Default: 4 */
  height?: number
}

export interface SkeletonCardProps {
  /**
   * Line widths as fractions 0-1, or array of { width, height } for varied lines.
   * Default: [1, 0.8, 0.6]
   */
  lines?: number[] | SkeletonCardLine[]
  /** Show header area. Default: true */
  hasHeader?: boolean
  /** Show footer area. Default: false */
  hasFooter?: boolean
  /** Optional className */
  className?: string
}

const defaultLines = [1, 0.8, 0.6]

function normalizeLines(
  lines: number[] | SkeletonCardLine[]
): Array<{ width: number; height: number }> {
  return lines.map((line) =>
    typeof line === 'number'
      ? { width: line, height: 4 }
      : { width: line.width ?? 1, height: line.height ?? 4 }
  )
}

export function SkeletonCard({
  lines = defaultLines,
  hasHeader = true,
  hasFooter = false,
  className,
}: SkeletonCardProps) {
  const normalized = normalizeLines(lines)

  return (
    <Card className={className}>
      {hasHeader && (
        <CardHeader className="space-y-2">
          <Shimmer className="h-6 w-48" aria-hidden />
          <Shimmer className="h-4 w-64" aria-hidden />
        </CardHeader>
      )}
      <CardContent className="space-y-3 pt-0">
        {normalized.map(({ width, height }, i) => (
          <Shimmer
            key={i}
            className="min-h-[0.25rem]"
            style={{
              width: `${width * 100}%`,
              height: `${height * 0.25}rem`,
            }}
            aria-hidden
          />
        ))}
      </CardContent>
      {hasFooter && (
        <CardFooter className="flex gap-2 pt-4">
          <Shimmer className="h-9 w-24 rounded-md" aria-hidden />
          <Shimmer className="h-9 w-20 rounded-md" aria-hidden />
        </CardFooter>
      )}
    </Card>
  )
}
