/**
 * KPI Tile - compact metric with optional trend and status.
 * Uses design tokens for colors; supports aria-label for accessibility.
 */

import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const VARIANT_STYLES = {
  default: 'text-foreground',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
} as const

const ICON_SIZE = 'h-5 w-5'

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
    <div
      role="region"
      aria-label={resolvedAriaLabel}
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-2xl font-semibold', VARIANT_STYLES[variant])}>
            {value}
          </p>
          {delta !== undefined && (
            <p className={cn('mt-1 text-xs font-medium', VARIANT_STYLES[variant])}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% {deltaLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2" aria-hidden>
            <Icon className={cn(ICON_SIZE, 'text-primary')} />
          </div>
        )}
      </div>
    </div>
  )
}
