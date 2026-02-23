/**
 * Admin Settings - Feature Toggles & Compliance.
 */

import { ToggleLeft, FileText, Shield, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useAdminFeatureToggles,
  useAdminExportJobs,
  useAdminRetentionPolicies,
  useAdminAuditLogs,
  useFeatureToggleUpdate,
  useCreateExport,
} from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function AdminSettingsPage() {
  const { data: features, isLoading: featuresLoading } = useAdminFeatureToggles()
  const { data: exports, isLoading: exportsLoading } = useAdminExportJobs()
  const { data: retentionPolicies } = useAdminRetentionPolicies()
  const { data: auditLogs, isLoading: logsLoading } = useAdminAuditLogs()

  const updateFeature = useFeatureToggleUpdate()
  const createExport = useCreateExport()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Feature toggles, export & compliance, audit logs, retention policies
        </p>
      </div>

      {/* Feature Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-primary" />
            Feature Toggles
          </CardTitle>
          <CardDescription>
            Enable/disable enterprise features, rollout controls, environment flags
          </CardDescription>
        </CardHeader>
        <CardContent>
          {featuresLoading ? (
            <Skeleton className="h-32" />
          ) : features && features.length > 0 ? (
            <div className="space-y-6">
              {features.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <Label htmlFor={`feature-${f.id}`} className="font-medium">
                      {f.feature_name}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {f.rollout_percentage}% rollout · {f.environment}
                    </p>
                  </div>
                  <Switch
                    id={`feature-${f.id}`}
                    checked={f.enabled}
                    onCheckedChange={(checked) =>
                      updateFeature.mutate({
                        featureName: f.feature_name,
                        enabled: checked,
                        rolloutPercentage: f.rollout_percentage,
                      })
                    }
                    disabled={updateFeature.isPending}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No feature toggles configured</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Jobs
            </CardTitle>
            <CardDescription>Export job queue, policy editor, audit log viewer</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              className="mb-4"
              onClick={() =>
                createExport.mutate({ type: 'audit_log', scope: 'all' })
              }
              disabled={createExport.isPending}
            >
              Create export
            </Button>
            {exportsLoading ? (
              <Skeleton className="h-24" />
            ) : exports && exports.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exports.slice(0, 5).map((e) => (
                    <TableRow key={e.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{e.type}</TableCell>
                      <TableCell>{e.scope}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'rounded-md px-2 py-0.5 text-xs font-medium',
                            e.status === 'completed' && 'bg-success/20 text-primary',
                            e.status === 'running' && 'bg-warning/50 text-foreground',
                            e.status === 'pending' && 'bg-muted text-muted-foreground',
                            e.status === 'failed' && 'bg-destructive/20 text-destructive'
                          )}
                        >
                          {e.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(e.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No export jobs</p>
            )}
          </CardContent>
        </Card>

        {/* Retention Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Retention Policies
            </CardTitle>
            <CardDescription>Data retention duration and scope</CardDescription>
          </CardHeader>
          <CardContent>
            {retentionPolicies && retentionPolicies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scope</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Enabled</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {retentionPolicies.map((r) => (
                    <TableRow key={r.id} className="transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{r.scope}</TableCell>
                      <TableCell>{r.duration_days} days</TableCell>
                      <TableCell>{r.enabled ? 'Yes' : 'No'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-muted-foreground">No retention policies</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Audit Logs
          </CardTitle>
          <CardDescription>Admin action history, searchable</CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <Skeleton className="h-32" />
          ) : auditLogs && auditLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Admin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.slice(0, 10).map((log) => (
                  <TableRow key={log.id} className="transition-colors hover:bg-muted/50">
                    <TableCell className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell>
                      {log.target_type}:{log.target_id}
                    </TableCell>
                    <TableCell>{log.admin_id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No audit logs</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
