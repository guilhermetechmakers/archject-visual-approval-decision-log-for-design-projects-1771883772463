/**
 * Accounts Overview Card - KPIs and plan distribution.
 * Uses design tokens, consistent icon sizing, and accessible markup.
 * Supports loading, error, and empty states.
 */

import { Building2, Users, TrendingUp, PieChart, Inbox } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { KpiTile } from './kpi-tile'
import { mockHealthHistory } from '@/lib/admin-mock'
import type { DashboardSummary } from '@/types/admin'
import { cn } from '@/lib/utils'

/** Consistent icon size - design system aligned with KpiTile */
const ICON_SIZE = 'h-5 w-5'

interface AccountsOverviewCardProps {
  data?: DashboardSummary['accounts'] | null
  isLoading?: boolean
  error?: Error | null
  className?: string
}

const chartData = mockHealthHistory.slice(-12).map((_, i) => ({
  name: `${i + 1}h`,
  workspaces: 1200 + Math.floor(Math.random() * 100),
}))

function PlanDistributionEmpty() {
  return (
    <div
      role="status"
      aria-label="No plan distribution data available"
      className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/50 px-6 py-8 text-center"
    >
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full bg-muted"
        aria-hidden
      >
        <Inbox className={cn(ICON_SIZE, 'text-muted-foreground')} aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">No plan distribution data</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Plan distribution will appear when workspace data is available.
        </p>
      </div>
    </div>
  )
}

function AccountsOverviewSkeleton() {
  return (
    <Card className="overflow-hidden" aria-busy="true" aria-label="Loading accounts overview">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div>
          <Skeleton className="mb-3 h-4 w-32" />
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}

export function AccountsOverviewCard({
  data,
  isLoading = false,
  error = null,
  className,
}: AccountsOverviewCardProps) {
  if (isLoading) {
    return <AccountsOverviewSkeleton />
  }

  if (error) {
    return (
      <Card
        className={cn('overflow-hidden border-destructive/50', className)}
        role="alert"
        aria-live="assertive"
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className={cn(ICON_SIZE, 'text-primary')} aria-hidden />
            Accounts Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
            <AlertTitle>Failed to load accounts data</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const hasPlanDistribution = data.plan_distribution?.length > 0

  return (
    <Card
      className={cn('overflow-hidden shadow-card', className)}
      role="region"
      aria-label="Accounts overview with active workspaces, trial signups, churn rate, plan distribution, and activity chart"
    >
      <CardHeader className="pb-2">
        <CardTitle
          className="flex items-center gap-2 text-lg"
          id="accounts-overview-title"
        >
          <Building2
            className={cn(ICON_SIZE, 'text-primary')}
            aria-hidden
          />
          Accounts Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          role="list"
          aria-label="Account metrics"
        >
          <KpiTile
            label="Active Workspaces"
            value={data.total_active_workspaces.toLocaleString()}
            icon={Building2}
            ariaLabel={`Active workspaces: ${data.total_active_workspaces.toLocaleString()}`}
          />
          <KpiTile
            label="Trial Signups"
            value={data.trial_signups}
            icon={Users}
            delta={12}
            deltaLabel="vs last week"
            variant="success"
            ariaLabel={`Trial signups: ${data.trial_signups}, up 12% vs last week`}
          />
          <KpiTile
            label="Churn Rate"
            value={`${data.churn_rate}%`}
            icon={TrendingUp}
            delta={-0.3}
            deltaLabel="vs last month"
            variant="success"
            ariaLabel={`Churn rate: ${data.churn_rate}%, down 0.3% vs last month`}
          />
        </div>

        <section aria-labelledby="plan-distribution-heading">
          <h4
            id="plan-distribution-heading"
            className="mb-3 text-sm font-medium text-muted-foreground"
          >
            Plan Distribution
          </h4>
          {hasPlanDistribution ? (
            <div
              className="flex flex-wrap gap-4"
              role="list"
              aria-label="Plan distribution by count"
            >
              {data.plan_distribution.map((p) => (
                <div
                  key={p.plan}
                  role="listitem"
                  className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2"
                  aria-label={`${p.plan}: ${p.count} workspaces`}
                >
                  <PieChart
                    className={cn(ICON_SIZE, 'text-primary')}
                    aria-hidden
                  />
                  <span className="font-medium capitalize">{p.plan}</span>
                  <span className="text-muted-foreground">{p.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <PlanDistributionEmpty />
          )}
        </section>

        <section
          className="h-32"
          role="img"
          aria-label="Graph showing workspace count over the last 12 hours"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="workspaceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                stroke="rgb(var(--muted-foreground))"
              />
              <YAxis hide domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgb(var(--card))',
                  border: '1px solid rgb(var(--border))',
                  borderRadius: '0.5rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="workspaces"
                stroke="rgb(var(--primary))"
                fill="url(#workspaceGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </CardContent>
    </Card>
  )
}
