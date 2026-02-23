import { Shield, FileDown, History, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SettingsCompliancePanelProps {
  projectId?: string
  onExportAuditLogs?: () => void
  onViewRetentionPolicies?: () => void
  className?: string
}

export function SettingsCompliancePanel({
  projectId: _projectId,
  onExportAuditLogs,
  onViewRetentionPolicies,
  className,
}: SettingsCompliancePanelProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <h2 className="text-lg font-semibold">Settings & Compliance</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-all hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Audit logs</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              View and export activity history for compliance and review.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onExportAuditLogs}
            >
              Export audit logs
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-card-hover">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Retention policies</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure data retention and archival rules.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onViewRetentionPolicies}
            >
              View policies
            </Button>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-card-hover sm:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileDown className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Data export</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Export project data in PDF, CSV, or JSON format. Includes
              decisions, options, comments, approvals, and file references.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                Export PDF
              </Button>
              <Button variant="outline" size="sm">
                Export CSV
              </Button>
              <Button variant="outline" size="sm">
                Export JSON
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all hover:shadow-card-hover sm:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Privacy controls</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Manage access controls, data visibility, and enterprise privacy
              settings.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
