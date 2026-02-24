/**
 * Top Tenants Panel - workspaces by usage.
 * Design: card-based, empty state with helpful copy, design tokens.
 */

import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DashboardSummary } from '@/types/admin'
import { cn } from '@/lib/utils'

interface TopTenantsPanelProps {
  topTenants: NonNullable<DashboardSummary['top_tenants']>
  className?: string
}

function TopTenantsEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      role="status"
      aria-label="No tenant usage data"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <BarChart3 className="h-6 w-6 text-muted-foreground" aria-hidden />
      </div>
      <p className="mt-4 text-sm font-medium text-foreground">
        No usage data yet
      </p>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Workspace usage will appear here as tenants start using the platform.
      </p>
    </div>
  )
}

export function TopTenantsPanel({ topTenants, className }: TopTenantsPanelProps) {
  const tenants = topTenants ?? []
  const isEmpty = tenants.length === 0

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Top Tenants by Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <TopTenantsEmptyState />
        ) : (
          <ul className="space-y-4">
            {tenants.map((t) => (
              <li key={t.workspace_id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.workspace_name}</span>
                  <span className="text-muted-foreground">
                    {t.usage.toLocaleString()}
                  </span>
                </div>
                <Progress
                  value={(t.usage / Math.max(...tenants.map((x) => x.usage), 1)) * 100}
                  className="h-2"
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
