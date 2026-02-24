/**
 * TelemetryPanel - Lightweight visualizations for approval timelines
 * and decision throughput. Design: clean charts, subtle grids, status badges.
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Decision } from '@/types/workspace'
import type { ActivityLog } from '@/types/workspace'

export interface TelemetryPanelProps {
  decisions: Decision[]
  activity: ActivityLog[]
  projectId?: string
  className?: string
}

function aggregateByWeek(
  decisions: Decision[],
  activity: ActivityLog[]
): { week: string; approvals: number; created: number; changesRequested: number }[] {
  const weekMap = new Map<
    string,
    { approvals: number; created: number; changesRequested: number }
  >()

  const getWeekKey = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    const start = new Date(d)
    start.setDate(d.getDate() - d.getDay())
    return start.toISOString().slice(0, 10)
  }

  decisions.forEach((d) => {
    const created = getWeekKey(new Date(d.created_at))
    if (!weekMap.has(created)) {
      weekMap.set(created, { approvals: 0, created: 0, changesRequested: 0 })
    }
    weekMap.get(created)!.created += 1

    if (d.status === 'approved' && d.approved_at) {
      const approved = getWeekKey(new Date(d.approved_at))
      if (!weekMap.has(approved)) {
        weekMap.set(approved, { approvals: 0, created: 0, changesRequested: 0 })
      }
      weekMap.get(approved)!.approvals += 1
    }
  })

  activity.forEach((a) => {
    const week = getWeekKey(new Date(a.created_at))
    if (!weekMap.has(week)) {
      weekMap.set(week, { approvals: 0, created: 0, changesRequested: 0 })
    }
    const row = weekMap.get(week)!
    if (a.type === 'approval') row.approvals += 1
  })

  const sorted = [...weekMap.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-8)
    .map(([week, data]) => ({
      week: new Date(week).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      }),
      ...data,
    }))

  return sorted
}

export function TelemetryPanel({
  decisions,
  activity,
  projectId: _projectId,
  className,
}: TelemetryPanelProps) {
  const data = aggregateByWeek(decisions, activity)
  const pendingCount = decisions.filter((d) => d.status === 'pending').length
  const approvedCount = decisions.filter((d) => d.status === 'approved').length
  const rejectedCount = decisions.filter((d) => d.status === 'rejected').length

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-xl border border-border bg-card shadow-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Pending
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {pendingCount}
            </p>
            <div
              className="mt-2 h-1.5 w-full rounded-full"
              style={{ backgroundColor: 'rgba(var(--warning), 0.3)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (pendingCount / Math.max(1, decisions.length)) * 100)}%`,
                  backgroundColor: 'rgb(var(--warning))',
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border bg-card shadow-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Approved
            </p>
            <p className="mt-1 text-2xl font-semibold text-success">
              {approvedCount}
            </p>
            <div
              className="mt-2 h-1.5 w-full rounded-full"
              style={{ backgroundColor: 'rgba(var(--success), 0.3)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (approvedCount / Math.max(1, decisions.length)) * 100)}%`,
                  backgroundColor: 'rgb(var(--success))',
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-xl border border-border bg-card shadow-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-muted-foreground">
              Rejected
            </p>
            <p className="mt-1 text-2xl font-semibold text-destructive">
              {rejectedCount}
            </p>
            <div
              className="mt-2 h-1.5 w-full rounded-full"
              style={{ backgroundColor: 'rgba(var(--destructive), 0.3)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, (rejectedCount / Math.max(1, decisions.length)) * 100)}%`,
                  backgroundColor: 'rgb(var(--destructive))',
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-xl border border-border bg-card shadow-card">
        <CardHeader>
          <h3 className="text-base font-semibold">Approval timeline</h3>
          <p className="text-sm text-muted-foreground">
            Decisions created and approved by week
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full">
            {data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="gradientApprovals"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="rgb(var(--primary))"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="100%"
                        stopColor="rgb(var(--primary))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient
                      id="gradientCreated"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="rgb(var(--muted-foreground))"
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor="rgb(var(--muted-foreground))"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgb(var(--border))"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'rgb(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'rgb(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(var(--card))',
                      border: '1px solid rgb(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 16px rgba(34, 42, 89, 0.05)',
                    }}
                    labelStyle={{ color: 'rgb(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="created"
                    name="Created"
                    stroke="rgb(var(--muted-foreground))"
                    fill="url(#gradientCreated)"
                    strokeWidth={1.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="approvals"
                    name="Approved"
                    stroke="rgb(var(--primary))"
                    fill="url(#gradientApprovals)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-secondary/20 text-sm text-muted-foreground">
                No data yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
