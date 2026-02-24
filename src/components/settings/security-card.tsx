import { Link } from 'react-router-dom'
import { Shield, Download, KeyRound, AlertCircle, FileText } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSettingsAuditLogsStrict } from '@/hooks/use-settings'
import { Skeleton } from '@/components/ui/skeleton'

function AuditLogErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center sm:px-6 sm:py-10"
      role="alert"
      aria-label="Failed to load audit logs"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 sm:h-14 sm:w-14">
        <AlertCircle className="h-6 w-6 text-destructive sm:h-7 sm:w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
        Failed to load audit logs
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Something went wrong while loading security activity. Please try again.
      </p>
      <Button
        variant="outline"
        size="sm"
        className="mt-4 rounded-pill transition-all duration-200 hover:scale-[1.02] hover:shadow-card-hover"
        onClick={onRetry}
        aria-label="Retry loading audit logs"
      >
        Try again
      </Button>
    </div>
  )
}

function AuditLogEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 py-8 text-center sm:px-6 sm:py-10 animate-fade-in"
      role="status"
      aria-label="No audit log entries"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted sm:h-14 sm:w-14">
        <FileText className="h-6 w-6 text-muted-foreground sm:h-7 sm:w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground sm:text-lg">
        No audit log entries yet
      </h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Security activity will appear here once actions are recorded.
      </p>
    </div>
  )
}

export function SecurityCard() {
  const { data: auditLogs, isLoading, isError, refetch } = useSettingsAuditLogsStrict({ limit: 10 })

  const logs = auditLogs ?? []

  return (
    <Card className="rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" aria-hidden />
          <CardTitle>Security & compliance</CardTitle>
        </div>
        <CardDescription>
          Audit logs, 2FA, and privacy controls
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
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
            <Link
              to="/dashboard/settings/account"
              id="password-link"
              aria-label="Go to account settings to change password"
            >
              Change password
            </Link>
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Recent audit log</p>
          {isLoading ? (
            <div className="space-y-2" role="status" aria-label="Loading audit logs">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" aria-hidden />
              ))}
            </div>
          ) : isError ? (
            <AuditLogErrorState onRetry={() => refetch()} />
          ) : logs.length === 0 ? (
            <AuditLogEmptyState />
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col justify-between gap-1 rounded-lg border border-border px-3 py-2 text-sm sm:flex-row sm:items-center"
                >
                  <div>
                    <span className="font-medium text-foreground">{log.action}</span>
                    <span className="text-muted-foreground"> → {log.target}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          {!isLoading && (
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link
                to="/dashboard/settings/data-export"
                className="inline-flex items-center gap-2"
                aria-label="Export audit logs to data export page"
              >
                <Download className="h-4 w-4" aria-hidden />
                Export audit logs
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
