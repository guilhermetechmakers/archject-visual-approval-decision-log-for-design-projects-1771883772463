/**
 * Top Tenants Panel - workspaces by usage.
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

export function TopTenantsPanel({ topTenants, className }: TopTenantsPanelProps) {
  if (!topTenants || topTenants.length === 0) return null

  const maxUsage = Math.max(...topTenants.map((t) => t.usage), 1)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-5 w-5 text-primary" />
          Top Tenants by Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {topTenants.map((t) => (
            <li key={t.workspace_id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{t.workspace_name}</span>
                <span className="text-muted-foreground">
                  {t.usage.toLocaleString()}
                </span>
              </div>
              <Progress
                value={(t.usage / maxUsage) * 100}
                className="h-2"
              />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
