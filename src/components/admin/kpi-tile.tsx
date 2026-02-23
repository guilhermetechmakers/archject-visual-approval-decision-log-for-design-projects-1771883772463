/**
 * KPI Tile - compact metric with optional trend and status.
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
  className?: string
}

export function KpiTile({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel,
  variant = 'default',
  className,
}: KpiTileProps) {
  const variantStyles = {
    default: 'text-foreground',
    success: 'text-[rgb(123,228,149)]',
    warning: 'text-[rgb(255,232,163)]',
    destructive: 'text-[rgb(255,108,108)]',
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-2xl font-semibold', variantStyles[variant])}>
            {value}
          </p>
          {delta !== undefined && (
            <p className={cn('mt-1 text-xs font-medium', variantStyles[variant])}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}% {deltaLabel}
            </p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" aria-hidden />
          </div>
        )}
      </div>
    </div>
  )
}
