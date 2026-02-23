import { Shield, Settings } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SSOConfig } from '@/types/team'

export interface SSOLockupPanelProps {
  config: SSOConfig
  onConfigure?: () => void
  className?: string
}

export function SSOLockupPanel({
  config,
  onConfigure,
  className,
}: SSOLockupPanelProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Enterprise SSO / SAML</CardTitle>
            <CardDescription>
              Configure single sign-on for your organization
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Status</p>
            <p className="text-xs text-muted-foreground">
              {config.enabled
                ? `Configured with ${config.provider ?? 'provider'}`
                : 'Not configured'}
            </p>
          </div>
          <Badge variant={config.enabled ? 'success' : 'secondary'}>
            {config.enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        {config.enabled && config.lastConfiguredAt && (
          <p className="text-xs text-muted-foreground">
            Last configured:{' '}
            {new Date(config.lastConfiguredAt).toLocaleDateString()}
          </p>
        )}
        <Button
          className="w-full sm:w-auto"
          onClick={onConfigure}
        >
          <Settings className="mr-2 h-4 w-4" />
          {config.enabled ? 'Manage SSO' : 'Configure SSO'}
        </Button>
      </CardContent>
    </Card>
  )
}
