/**
 * Accounts Overview Card - KPIs and plan distribution.
 */

import { Building2, Users, TrendingUp, PieChart } from 'lucide-react'
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
import { KpiTile } from './kpi-tile'
import { mockHealthHistory } from '@/lib/admin-mock'
import type { DashboardSummary } from '@/types/admin'
import { cn } from '@/lib/utils'

interface AccountsOverviewCardProps {
  data: DashboardSummary['accounts']
  className?: string
}

const chartData = mockHealthHistory.slice(-12).map((_, i) => ({
  name: `${i + 1}h`,
  workspaces: 1200 + Math.floor(Math.random() * 100),
}))

export function AccountsOverviewCard({ data, className }: AccountsOverviewCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Building2 className="h-5 w-5 text-primary" />
          Accounts Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiTile
            label="Active Workspaces"
            value={data.total_active_workspaces.toLocaleString()}
            icon={Building2}
          />
          <KpiTile
            label="Trial Signups"
            value={data.trial_signups}
            icon={Users}
            delta={12}
            deltaLabel="vs last week"
            variant="success"
          />
          <KpiTile
            label="Churn Rate"
            value={`${data.churn_rate}%`}
            icon={TrendingUp}
            delta={-0.3}
            deltaLabel="vs last month"
            variant="success"
          />
        </div>
        <div>
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">
            Plan Distribution
          </h4>
          <div className="flex flex-wrap gap-4">
            {data.plan_distribution.map((p) => (
              <div
                key={p.plan}
                className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2"
              >
                <PieChart className="h-4 w-4 text-primary" />
                <span className="font-medium capitalize">{p.plan}</span>
                <span className="text-muted-foreground">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="workspaceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="rgb(var(--muted-foreground))" />
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
        </div>
      </CardContent>
    </Card>
  )
}
