/**
 * KPI cards for analytics dashboard - clickable for drill-down
 */

import { Clock, FileCheck, TrendingUp } from 'lucide-react'
import { KpiTile } from '@/components/admin/kpi-tile'
import { cn } from '@/lib/utils'
import type { StudioKpis } from '@/types/analytics'

export interface AnalyticsKpiCardsProps {
  kpis: StudioKpis
  onKpiClick?: (type: 'time' | 'pending' | 'approval') => void
  className?: string
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

export function AnalyticsKpiCards({
  kpis,
  onKpiClick,
  className,
}: AnalyticsKpiCardsProps) {
  const cards: Array<{
    key: 'time' | 'pending' | 'approval'
    label: string
    value: string | number
    delta?: number
    deltaLabel?: string
    icon: typeof Clock
    variant: 'default' | 'success' | 'warning' | 'destructive'
  }> = [
    {
      key: 'time',
      label: 'Avg time to approve',
      value: formatHours(kpis.averageTimeToApprove),
      delta: kpis.deltaTimeToApprove,
      deltaLabel: 'vs prior period',
      icon: Clock,
      variant: 'default',
    },
    {
      key: 'pending',
      label: 'Pending decisions',
      value: kpis.pendingDecisions,
      delta: kpis.deltaPending,
      deltaLabel: 'vs prior period',
      icon: FileCheck,
      variant: (kpis.pendingDecisions > 10 ? 'warning' : 'default') as 'default' | 'success' | 'warning' | 'destructive',
    },
    {
      key: 'approval',
      label: 'Client approval rate',
      value: `${kpis.clientApprovalRate}%`,
      delta: kpis.deltaApprovalRate,
      deltaLabel: 'vs prior period',
      icon: TrendingUp,
      variant: (kpis.clientApprovalRate >= 75 ? 'success' : 'warning') as 'default' | 'success' | 'warning' | 'destructive',
    },
  ]

  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-3',
        className
      )}
    >
      {cards.map((card) => (
        <button
          key={card.key}
          type="button"
          onClick={() => onKpiClick?.(card.key)}
          className="text-left transition-transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-xl"
          aria-label={`${card.label}: ${card.value}. Click to view details`}
        >
          <KpiTile
            label={card.label}
            value={card.value}
            icon={card.icon}
            delta={card.delta}
            deltaLabel={card.deltaLabel}
            variant={card.variant}
          />
        </button>
      ))}
    </div>
  )
}
