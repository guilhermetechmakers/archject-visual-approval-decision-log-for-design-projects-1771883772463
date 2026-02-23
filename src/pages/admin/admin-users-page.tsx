/**
 * Admin - User Management - workspace list with impersonate, escalate, export, audit.
 */

import * as React from 'react'
import { UserCog, Download, AlertCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AdminDataTable,
  ImpersonationModal,
  DisableWorkspaceModal,
  ExportWorkspaceModal,
  RetentionPolicyModal,
  CreateEscalationModal,
  AuditLogPanel,
  WorkspaceFiltersPanel,
  WorkspaceDetailDrawer,
} from '@/components/admin'
import type { ColumnDef } from '@/components/admin/admin-data-table'
import {
  useAdminWorkspaces,
  useWorkspaceImpersonate,
  useWorkspaceDisable,
  useWorkspaceExport,
  useWorkspaceRetention,
  useCreateEscalation,
} from '@/hooks/use-admin'
import type { Workspace } from '@/types/admin'
import { Badge } from '@/components/ui/badge'
import type { AdminWorkspacesFilters } from '@/api/admin'
import type { WorkspaceFilters } from '@/components/admin/workspace-filters-panel'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  active: 'success',
  suspended: 'destructive',
  archived: 'warning',
  disabled: 'destructive',
  pending: 'warning',
}

function getInitials(name?: string, email?: string) {
  if (name) {
    const parts = name.split(' ')
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.slice(0, 2).toUpperCase()
  }
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const defaultFilters: WorkspaceFilters = {
  search: '',
  status: 'all',
  plan: 'all',
  domain: '',
}

function toApiFilters(f: WorkspaceFilters): AdminWorkspacesFilters {
  return {
    search: f.search.trim() || undefined,
    status: f.status === 'all' ? undefined : f.status,
    plan: f.plan === 'all' ? undefined : f.plan,
    domain: f.domain.trim() || undefined,
  }
}

export function AdminUsersPage() {
  const [filters, setFilters] = React.useState<WorkspaceFilters>(defaultFilters)
  const [selectedWorkspace, setSelectedWorkspace] = React.useState<Workspace | null>(null)
  const [detailDrawerOpen, setDetailDrawerOpen] = React.useState(false)
  const [impersonateWorkspace, setImpersonateWorkspace] = React.useState<Workspace | null>(null)
  const [disableWorkspace, setDisableWorkspace] = React.useState<Workspace | null>(null)
  const [exportWorkspace, setExportWorkspace] = React.useState<Workspace | null>(null)
  const [retentionWorkspace, setRetentionWorkspace] = React.useState<Workspace | null>(null)
  const [escalationModalOpen, setEscalationModalOpen] = React.useState(false)
  const [escalationWorkspace, setEscalationWorkspace] = React.useState<Workspace | null>(null)

  const { data: workspaces, isLoading } = useAdminWorkspaces(toApiFilters(filters))
  const impersonateMutation = useWorkspaceImpersonate()
  const disableMutation = useWorkspaceDisable()
  const exportMutation = useWorkspaceExport()
  const retentionMutation = useWorkspaceRetention()
  const createEscalationMutation = useCreateEscalation()

  const handleImpersonateConfirm = (reason: string) => {
    if (!impersonateWorkspace) return
    impersonateMutation.mutate({ workspaceId: impersonateWorkspace.id, reason })
  }

  const handleDisableConfirm = (reason: string) => {
    if (!disableWorkspace) return
    disableMutation.mutate({ workspaceId: disableWorkspace.id, reason })
    setDisableWorkspace(null)
  }

  const handleExportConfirm = () => {
    if (!exportWorkspace) return
    exportMutation.mutate(exportWorkspace.id)
    setExportWorkspace(null)
  }

  const handleRetentionConfirm = (policy: { duration_days: number; scope: string }) => {
    if (!retentionWorkspace) return
    retentionMutation.mutate({ workspaceId: retentionWorkspace.id, policy })
    setRetentionWorkspace(null)
  }

  const handleEscalateWorkspace = (w: Workspace) => {
    setEscalationWorkspace(w)
    setEscalationModalOpen(true)
  }

  const handleCreateEscalation = (data: {
    workspace_id: string
    user_id?: string
    reason: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    notes?: string
    assigned_team?: string
  }) => {
    createEscalationMutation.mutate(data)
    setEscalationModalOpen(false)
    setEscalationWorkspace(null)
  }

  const columns: ColumnDef<Workspace>[] = [
    {
      id: 'name',
      header: 'Workspace',
      accessor: (row) => (
        <div className="font-medium">{row.name}</div>
      ),
    },
    {
      id: 'owner',
      header: 'Owner',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">
              {getInitials(row.owner_name, row.owner_email)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{row.owner_name ?? row.owner_email ?? '—'}</p>
            <p className="text-xs text-muted-foreground">{row.owner_email ?? ''}</p>
          </div>
        </div>
      ),
    },
    { id: 'plan', header: 'Plan', accessor: (row) => <span className="capitalize">{row.plan}</span> },
    {
      id: 'domain',
      header: 'Domain',
      accessor: (row) => row.domain ?? row.domain_alias ?? '—',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <Badge variant={statusVariant[row.status] ?? 'default'}>{row.status}</Badge>
      ),
    },
    {
      id: 'last_activity',
      header: 'Last Activity',
      accessor: (row) => formatDate(row.last_activity),
    },
    {
      id: 'actions',
      header: '',
      accessor: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            title="View details"
            aria-label="View details"
            onClick={() => {
              setSelectedWorkspace(row)
              setDetailDrawerOpen(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Impersonate"
            aria-label="Impersonate"
            onClick={() => setImpersonateWorkspace(row)}
          >
            <UserCog className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Create escalation"
            aria-label="Create escalation"
            onClick={() => handleEscalateWorkspace(row)}
          >
            <AlertCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Export"
            aria-label="Export"
            onClick={() => setExportWorkspace(row)}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-[180px]',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="mt-1 text-muted-foreground">
          View and intervene in customer workspaces, impersonate for support, escalate issues.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                Workspaces
              </CardTitle>
              <CardDescription>
                Workspace list with actions: impersonate, escalate, export, view details.
              </CardDescription>
              <WorkspaceFiltersPanel
                filters={filters}
                onFiltersChange={setFilters}
                onReset={() => setFilters(defaultFilters)}
                className="mt-4"
              />
            </CardHeader>
            <CardContent>
              <AdminDataTable<Workspace>
                columns={columns}
                data={workspaces ?? []}
                isLoading={isLoading}
                emptyMessage="No workspaces found"
                getRowId={(row) => row.id}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <AuditLogPanel defaultExpanded={true} />
        </div>
      </div>

      <ImpersonationModal
        open={!!impersonateWorkspace}
        onOpenChange={(open: boolean) => !open && setImpersonateWorkspace(null)}
        workspaceName={impersonateWorkspace?.name ?? ''}
        workspaceId={impersonateWorkspace?.id ?? ''}
        onConfirm={handleImpersonateConfirm}
        isLoading={impersonateMutation.isPending}
      />

      <DisableWorkspaceModal
        open={!!disableWorkspace}
        onOpenChange={(open: boolean) => !open && setDisableWorkspace(null)}
        workspaceName={disableWorkspace?.name ?? ''}
        workspaceId={disableWorkspace?.id ?? ''}
        onConfirm={handleDisableConfirm}
        isLoading={disableMutation.isPending}
      />

      <ExportWorkspaceModal
        open={!!exportWorkspace}
        onOpenChange={(open: boolean) => !open && setExportWorkspace(null)}
        workspaceName={exportWorkspace?.name ?? ''}
        workspaceId={exportWorkspace?.id ?? ''}
        onConfirm={handleExportConfirm}
        isLoading={exportMutation.isPending}
      />

      <RetentionPolicyModal
        open={!!retentionWorkspace}
        onOpenChange={(open: boolean) => !open && setRetentionWorkspace(null)}
        workspaceName={retentionWorkspace?.name ?? ''}
        workspaceId={retentionWorkspace?.id ?? ''}
        onConfirm={handleRetentionConfirm}
        isLoading={retentionMutation.isPending}
      />

      <CreateEscalationModal
        open={escalationModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) setEscalationWorkspace(null)
          setEscalationModalOpen(open)
        }}
        workspaces={(workspaces ?? []) as Workspace[]}
        defaultWorkspaceId={escalationWorkspace?.id}
        defaultUserId={escalationWorkspace?.owner_user_id}
        onConfirm={handleCreateEscalation}
        isLoading={createEscalationMutation.isPending}
      />

      <WorkspaceDetailDrawer
        workspace={selectedWorkspace}
        open={detailDrawerOpen}
        onOpenChange={setDetailDrawerOpen}
        onImpersonate={(w) => {
          setDetailDrawerOpen(false)
          setImpersonateWorkspace(w)
        }}
        onDisable={(w) => {
          setDetailDrawerOpen(false)
          setDisableWorkspace(w)
        }}
        onExport={(w) => {
          setDetailDrawerOpen(false)
          setExportWorkspace(w)
        }}
        onRetention={(w) => {
          setDetailDrawerOpen(false)
          setRetentionWorkspace(w)
        }}
        onEscalate={(w) => {
          setDetailDrawerOpen(false)
          handleEscalateWorkspace(w)
        }}
      />
    </div>
  )
}
