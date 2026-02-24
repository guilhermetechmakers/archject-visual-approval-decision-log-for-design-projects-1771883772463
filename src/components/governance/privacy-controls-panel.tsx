/**
 * Privacy Controls Panel - masking rules, export scope, data categories.
 */

import { Shield, Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePrivacyControls, useUpdatePrivacyControls, useGovernanceWorkspaces } from '@/hooks/use-governance'
import { cn } from '@/lib/utils'

export interface PrivacyControlsPanelProps {
  workspaceId?: string
  className?: string
}

export function PrivacyControlsPanel({ workspaceId, className }: PrivacyControlsPanelProps) {
  const { data: control, isLoading } = usePrivacyControls(workspaceId)
  const { data: workspaces } = useGovernanceWorkspaces()
  const updateMutation = useUpdatePrivacyControls()

  const effectiveWorkspaceId = workspaceId ?? workspaces?.[0]?.id ?? 'ws-1'

  if (isLoading) {
    return (
      <Card className={cn('rounded-xl border border-border shadow-card', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  const maskingRules = (control?.masking_rules as Array<{ field?: string; type?: string; show_last?: number }>) ?? []
  const dataCategories = (control?.data_categories as string[]) ?? []
  const accessControls = (control?.access_controls as { export_scope?: string; require_approval?: boolean }) ?? {}

  return (
    <Card className={cn('overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover', className)}>
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-primary" />
          Privacy Controls
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Data masking, export scope, and access controls for governance.
        </p>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        {maskingRules.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Masking rules</Label>
            <div className="mt-2 space-y-2">
              {maskingRules.map((rule, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"
                >
                  {rule.type === 'full' ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">{rule.field}</span>
                  <span className="text-muted-foreground">
                    {rule.type === 'full' ? 'Full mask' : `Partial (show last ${rule.show_last ?? 4})`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {dataCategories.length > 0 && (
          <div>
            <Label className="text-sm font-medium">Data categories</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {dataCategories.map((cat) => (
                <Badge key={cat} variant="secondary" className="rounded-full">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label className="text-sm font-medium">Export scope</Label>
          <Select
            value={accessControls.export_scope ?? 'workspace'}
            onValueChange={(v) =>
              updateMutation.mutate({
                workspaceId: effectiveWorkspaceId,
                data: {
                  access_controls: { ...accessControls, export_scope: v },
                },
              })
            }
          >
            <SelectTrigger className="mt-2 w-[200px] rounded-lg bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workspace">Workspace</SelectItem>
              <SelectItem value="project">Project</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {control?.last_applied_at && (
          <p className="text-xs text-muted-foreground">
            Last applied: {new Date(control.last_applied_at).toLocaleString()}
          </p>
        )}

        {!control && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Shield className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No privacy controls configured</p>
            <p className="text-xs text-muted-foreground">Configure in workspace settings</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
