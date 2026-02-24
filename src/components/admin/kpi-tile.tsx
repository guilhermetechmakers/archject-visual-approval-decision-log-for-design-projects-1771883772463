/**
 * KPI Tile - compact metric with optional trend and status.
 * Uses design tokens for colors; supports aria-label for accessibility.
 * Variant-aware icon styling for semantic status indicators.
 */

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface KpiTileProps {
  label: string
  value: string | number
  icon?: LucideIcon
  delta?: number
  deltaLabel?: string
  variant?: 'default' | 'success' | 'warning' | 'destructive'
  /** Accessible description for screen readers (defaults to "{label}: {value}") */
  ariaLabel?: string
  className?: string
}

const VARIANT_VALUE_STYLES = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
} as const

const VARIANT_ICON_STYLES = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/20 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
} as const

/** Consistent icon size for KPI tiles - design system aligned */
const KPI_ICON_SIZE = 'h-5 w-5'

export function KpiTile({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  variant = 'default',
  ariaLabel,
  className,
}: KpiTileProps) {
  const resolvedAriaLabel = ariaLabel ?? `${label}: ${value}`

  return (
    <Card
      role="region"
      aria-label={resolvedAriaLabel}
      className={cn(
        'p-4 transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p
              className={cn(
                'mt-1 text-xl font-semibold sm:text-2xl',
                VARIANT_VALUE_STYLES[variant]
              )}
            >
              {value}
            </p>
            {delta !== undefined && (
              <p
                className={cn(
                  'mt-1 text-xs font-medium',
                  VARIANT_VALUE_STYLES[variant]
                )}
              >
                {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% {deltaLabel}
              </p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                'shrink-0 rounded-lg p-2',
                VARIANT_ICON_STYLES[variant]
              )}
              aria-hidden
            >
              <Icon className={KPI_ICON_SIZE} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
