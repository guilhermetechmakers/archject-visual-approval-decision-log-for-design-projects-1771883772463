/**
 * Admin - User Management - workspace list with impersonate, escalate, export.
 */

import * as React from 'react'
import { UserCog, Download, AlertCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminDataTable, ImpersonationModal } from '@/components/admin'
import type { ColumnDef } from '@/components/admin/admin-data-table'
import { useAdminWorkspaces, useWorkspaceImpersonate } from '@/hooks/use-admin'
import type { Workspace } from '@/types/admin'
import { Badge } from '@/components/ui/badge'
const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  active: 'success',
  suspended: 'destructive',
  archived: 'warning',
}

export function AdminUsersPage() {
  const [search, setSearch] = React.useState('')
  const [impersonateWorkspace, setImpersonateWorkspace] = React.useState<Workspace | null>(null)

  const { data: workspaces, isLoading } = useAdminWorkspaces()
  const impersonateMutation = useWorkspaceImpersonate()

  const filtered = React.useMemo(() => {
    if (!workspaces) return []
    if (!search.trim()) return workspaces
    const q = search.toLowerCase()
    return workspaces.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q) ||
        w.account_id.toLowerCase().includes(q)
    )
  }, [workspaces, search])

  const handleImpersonateConfirm = () => {
    if (!impersonateWorkspace) return
    impersonateMutation.mutate(impersonateWorkspace.id)
  }

  const columns: ColumnDef<Workspace>[] = [
    { id: 'name', header: 'Workspace', accessor: 'name' },
    { id: 'account', header: 'Account', accessor: 'account_id' },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <Badge variant={statusVariant[row.status] ?? 'default'}>{row.status}</Badge>
      ),
    },
    { id: 'plan', header: 'Plan', accessor: 'plan' },
    { id: 'last_activity', header: 'Last Activity', accessor: 'last_activity' },
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
          <Button variant="ghost" size="icon-sm" title="Escalate" aria-label="Escalate">
            <AlertCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Export" aria-label="Export">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            Workspaces
          </CardTitle>
          <CardDescription>
            Workspace list with actions: impersonate, escalate, export, view details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminDataTable<Workspace>
            columns={columns}
            data={filtered}
            isLoading={isLoading}
            searchPlaceholder="Search workspaces..."
            searchValue={search}
            onSearchChange={setSearch}
            emptyMessage="No workspaces found"
            getRowId={(row) => row.id}
          />
        </CardContent>
      </Card>

      <ImpersonationModal
        open={!!impersonateWorkspace}
        onOpenChange={(open) => !open && setImpersonateWorkspace(null)}
        workspaceName={impersonateWorkspace?.name ?? ''}
        workspaceId={impersonateWorkspace?.id ?? ''}
        onConfirm={handleImpersonateConfirm}
        isLoading={impersonateMutation.isPending}
      />
    </div>
  )
}
