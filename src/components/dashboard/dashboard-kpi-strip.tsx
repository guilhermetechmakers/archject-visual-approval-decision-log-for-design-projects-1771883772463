/**
 * Dashboard KPI strip - total active projects, decisions awaiting client,
 * average decision duration, template adoption rate
 */

import { FolderKanban, FileCheck, Clock, TrendingUp } from 'lucide-react'
import { KpiTile } from '@/components/admin/kpi-tile'
import { cn } from '@/lib/utils'
import type { DashboardKpis } from '@/types/dashboard'

export interface DashboardKpiStripProps {
  kpis: DashboardKpis
  className?: string
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

export function DashboardKpiStrip({ kpis, className }: DashboardKpiStripProps) {
  const cards: Array<{
    key: keyof DashboardKpis
    label: string
    value: string | number
    delta?: number
    icon: typeof FolderKanban
    variant: 'default' | 'success' | 'warning' | 'destructive'
  }> = [
    {
      key: 'activeProjects',
      label: 'Active projects',
      value: kpis.activeProjects,
      delta: kpis.deltaActiveProjects,
      icon: FolderKanban,
      variant: 'default',
    },
    {
      key: 'decisionsAwaitingClient',
      label: 'Awaiting client',
      value: kpis.decisionsAwaitingClient,
      delta: kpis.deltaAwaitingClient,
      icon: FileCheck,
      variant: (kpis.decisionsAwaitingClient > 5 ? 'warning' : 'default') as 'default' | 'success' | 'warning' | 'destructive',
    },
    {
      key: 'averageDecisionDurationHours',
      label: 'Avg decision duration',
      value: formatHours(kpis.averageDecisionDurationHours),
      delta: kpis.deltaDecisionDuration,
      icon: Clock,
      variant: 'default',
    },
    {
      key: 'templateAdoptionRate',
      label: 'Template adoption',
      value: `${kpis.templateAdoptionRate}%`,
      delta: kpis.deltaTemplateAdoption,
      icon: TrendingUp,
      variant: (kpis.templateAdoptionRate >= 70 ? 'success' : 'warning') as 'default' | 'success' | 'warning' | 'destructive',
    },
  ]

  return (
    <div
      className={cn(
        'grid gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {cards.map((card) => (
        <KpiTile
          key={card.key}
          label={card.label}
          value={card.value}
          icon={card.icon}
          delta={card.delta}
          deltaLabel="vs prior period"
          variant={card.variant}
          className="transition-transform hover:scale-[1.02] hover:shadow-card-hover"
        />
      ))}
    </div>
  )
}
