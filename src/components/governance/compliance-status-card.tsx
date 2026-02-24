/**
 * Compliance Status Card - roadmap, encryption, audit trail status.
 */

import { Shield, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useComplianceStatus } from '@/hooks/use-governance'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  verified: 'Verified',
  in_progress: 'In progress',
  planned: 'Planned',
  completed: 'Completed',
}

export function ComplianceStatusCard() {
  const { data: status, isLoading } = useComplianceStatus()

  if (isLoading) {
    return (
      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  const items = [
    { label: 'Audit trail verified', value: status.audit_trail_verified, icon: CheckCircle },
    { label: 'Retention policy active', value: status.retention_policy_active, icon: CheckCircle },
    { label: 'Encryption at rest', value: status.encryption_at_rest, icon: Shield },
    { label: 'Encryption in transit', value: status.encryption_in_transit, icon: Shield },
    { label: 'SOC2 roadmap', value: status.soc2_roadmap_status, icon: Clock },
    { label: 'ISO roadmap', value: status.iso_roadmap_status, icon: Clock },
  ]

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" aria-hidden />
          Compliance Status
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Data governance and security controls
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const isBoolean = typeof item.value === 'boolean'
            const displayValue = isBoolean
              ? (item.value ? 'Yes' : 'No')
              : STATUS_LABELS[item.value as string] ?? item.value
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={cn(
                      'h-4 w-4',
                      isBoolean && item.value && 'text-success',
                      isBoolean && !item.value && 'text-muted-foreground',
                      !isBoolean && 'text-muted-foreground'
                    )}
                  />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Badge
                  variant={isBoolean && item.value ? 'default' : 'secondary'}
                  className={cn(
                    'rounded-full',
                    isBoolean && !item.value && 'bg-muted text-muted-foreground'
                  )}
                >
                  {displayValue}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
