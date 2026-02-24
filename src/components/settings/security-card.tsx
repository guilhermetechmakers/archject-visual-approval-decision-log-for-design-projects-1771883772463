import { Link } from 'react-router-dom'
import { Shield, ShieldCheck, Download, KeyRound } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useSettingsAuditLogs } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'

export function SecurityCard() {
  const { data: auditLogs, isLoading } = useSettingsAuditLogs({ limit: 10 })

  const logs = auditLogs ?? []

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Security & compliance</CardTitle>
        </div>
        <CardDescription>
          Audit logs, 2FA, and privacy controls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="password-link" className="cursor-pointer font-medium">
                Password
              </Label>
              <p className="text-sm text-muted-foreground">
                Change your password from account settings
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/settings/account" id="password-link">
              Change password
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <div>
              <Label htmlFor="2fa" className="cursor-pointer font-medium">
                Two-factor authentication
              </Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security
              </p>
            </div>
          </div>
          <Switch id="2fa" disabled />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Recent audit log</p>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">{log.action}</span>
                    <span className="text-muted-foreground"> → {log.target}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          <Button variant="outline" size="sm" className="mt-2">
            <Download className="mr-2 h-4 w-4" />
            Export audit logs
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
