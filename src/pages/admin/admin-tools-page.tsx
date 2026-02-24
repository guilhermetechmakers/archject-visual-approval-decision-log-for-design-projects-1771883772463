/**
 * Admin Tools & Moderation - user/workspace management, billing, disputes, escalations.
 */

import * as React from 'react'
import {
  UserMinus,
  UserCheck,
  Building2,
  CreditCard,
  MessageSquare,
  TicketPlus,
  Ban,
  Download,
  Database,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AdminDataTable,
  DisableWorkspaceModal,
  ExportWorkspaceModal,
  RetentionPolicyModal,
  CreateEscalationModal,
} from '@/components/admin'
import type { ColumnDef } from '@/components/admin/admin-data-table'
import {
  useAdminWorkspaces,
  useAdminUsers,
  useAdminDisputes,
  useAdminBillingExceptions,
  useAdminEscalations,
  useDisputeResolve,
  useDisputeEscalate,
  useBillingExceptionApprove,
  useBillingExceptionReject,
  useWorkspaceDisable,
  useWorkspaceExport,
  useWorkspaceRetention,
  useCreateEscalation,
  useBulkWorkspaceDisable,
  useUserSuspend,
  useUserActivate,
  useAdminForceLogout,
} from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import type { Workspace, AdminUser } from '@/types/admin'

const disputeStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  open: 'destructive',
  in_review: 'warning',
  resolved: 'success',
  escalated: 'default',
}

const billingStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

const escalationStatusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  open: 'destructive',
  in_progress: 'warning',
  resolved: 'success',
  closed: 'default',
}

const escalationPriorityVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  low: 'default',
  medium: 'default',
  high: 'warning',
  critical: 'destructive',
}

export function AdminToolsPage() {
  const [resolveNotes, setResolveNotes] = React.useState('')
  const [selectedDispute, setSelectedDispute] = React.useState<string | null>(null)
  const [selectedWorkspaceIds, setSelectedWorkspaceIds] = React.useState<Set<string>>(new Set())
  const [showCreateEscalation, setShowCreateEscalation] = React.useState(false)
  const [disableWorkspace, setDisableWorkspace] = React.useState<Workspace | null>(null)
  const [exportWorkspace, setExportWorkspace] = React.useState<Workspace | null>(null)
  const [retentionWorkspace, setRetentionWorkspace] = React.useState<Workspace | null>(null)
  const [showBulkDisable, setShowBulkDisable] = React.useState(false)
  const [forceLogoutUser, setForceLogoutUser] = React.useState<AdminUser | null>(null)

  const { data: disputes, isLoading: disputesLoading } = useAdminDisputes()
  const { data: billingExceptions, isLoading: billingLoading } = useAdminBillingExceptions()
  const { data: workspaces, isLoading: workspacesLoading } = useAdminWorkspaces()
  const { data: users, isLoading: usersLoading } = useAdminUsers()
  const { data: escalations, isLoading: escalationsLoading } = useAdminEscalations()

  const resolveMutation = useDisputeResolve()
  const escalateMutation = useDisputeEscalate()
  const approveMutation = useBillingExceptionApprove()
  const rejectMutation = useBillingExceptionReject()
  const disableMutation = useWorkspaceDisable()
  const exportMutation = useWorkspaceExport()
  const retentionMutation = useWorkspaceRetention()
  const createEscalationMutation = useCreateEscalation()
  const bulkDisableMutation = useBulkWorkspaceDisable()
  const suspendUserMutation = useUserSuspend()
  const activateUserMutation = useUserActivate()
  const forceLogoutMutation = useAdminForceLogout()

  const handleBulkDisableConfirm = (reason: string) => {
    if (selectedWorkspaceIds.size === 0 || !reason.trim()) return
    bulkDisableMutation.mutate({
      workspaceIds: Array.from(selectedWorkspaceIds),
      reason: reason.trim(),
    })
    setSelectedWorkspaceIds(new Set())
    setShowBulkDisable(false)
  }

  const userColumns: ColumnDef<AdminUser>[] = [
    {
      id: 'user',
      header: 'User',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {(row.name ?? row.email ?? '?').slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{row.name ?? row.email}</div>
            <div className="text-xs text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    { id: 'role', header: 'Role', accessor: (row) => <span className="capitalize">{row.role}</span> },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : row.status === 'suspended' ? 'destructive' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    { id: 'last_login', header: 'Last Login', accessor: (row) => new Date(row.last_login).toLocaleDateString() },
    {
      id: 'actions',
      header: '',
      accessor: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.status === 'suspended' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => activateUserMutation.mutate(row.id)}
              disabled={activateUserMutation.isPending}
              aria-label={`Activate ${row.email}`}
            >
              <UserCheck className="mr-1 h-4 w-4" />
              Activate
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => suspendUserMutation.mutate(row.id)}
              disabled={suspendUserMutation.isPending || row.role === 'owner'}
              aria-label={`Suspend ${row.email}`}
            >
              <UserMinus className="mr-1 h-4 w-4" />
              Suspend
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setForceLogoutUser(row)}
            aria-label={`Force sign-out ${row.email}`}
            title="Sign out from all devices"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  const workspaceColumns: ColumnDef<Workspace>[] = [
    { id: 'name', header: 'Workspace', accessor: (row) => <span className="font-medium">{row.name}</span> },
    { id: 'plan', header: 'Plan', accessor: (row) => <span className="capitalize">{row.plan}</span> },
    {
      id: 'status',
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : row.status === 'disabled' ? 'destructive' : 'warning'}>
          {row.status}
        </Badge>
      ),
    },
    { id: 'last_activity', header: 'Last Activity', accessor: (row) => row.last_activity.slice(0, 10) },
    {
      id: 'actions',
      header: '',
      accessor: (row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDisableWorkspace(row)}
            disabled={row.status === 'disabled'}
          >
            <Ban className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setExportWorkspace(row)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setRetentionWorkspace(row)}>
            <Database className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Tools & Moderation</h1>
        <p className="mt-1 text-muted-foreground">
          User management, workspace management, billing exceptions, disputes, support escalations
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="users" className="rounded-full">
            <UserCheck className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="rounded-full">
            <Building2 className="mr-2 h-4 w-4" />
            Workspaces
          </TabsTrigger>
          <TabsTrigger value="billing" className="rounded-full">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing & Disputes
          </TabsTrigger>
          <TabsTrigger value="escalations" className="rounded-full">
            <TicketPlus className="mr-2 h-4 w-4" />
            Escalations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserMinus className="h-5 w-5 text-primary" />
                Users Management
              </CardTitle>
              <CardDescription>
                View users with status, last login, associated workspaces, roles, and flags
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <AdminDataTable<AdminUser>
                  columns={userColumns}
                  data={users ?? []}
                  getRowId={(r) => r.id}
                  emptyMessage="No users found"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces" className="space-y-6">
          {selectedWorkspaceIds.size > 0 && (
            <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 animate-fade-in">
              <span className="text-sm font-medium">{selectedWorkspaceIds.size} workspace(s) selected</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedWorkspaceIds(new Set())}>
                  Clear
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowBulkDisable(true)}
                  disabled={bulkDisableMutation.isPending}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Bulk disable
                </Button>
              </div>
            </div>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Workspaces Management
              </CardTitle>
              <CardDescription>
                Bulk actions: disable, export data, apply retention policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {workspacesLoading ? (
                <Skeleton className="h-64" />
              ) : (
                <AdminDataTable<Workspace>
                  columns={workspaceColumns}
                  data={workspaces ?? []}
                  getRowId={(r) => r.id}
                  emptyMessage="No workspaces found"
                  selectable
                  selectedIds={selectedWorkspaceIds}
                  onSelectionChange={setSelectedWorkspaceIds}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Disputes
                  </CardTitle>
                  <CardDescription>Review and resolve workspace disputes</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {disputesLoading ? (
                  <Skeleton className="h-32" />
                ) : disputes && disputes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Workspace</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {disputes.map((d) => (
                        <TableRow key={d.id} className="transition-colors hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {d.workspace_name ?? d.workspace_id}
                          </TableCell>
                          <TableCell>
                            <Badge variant={disputeStatusVariant[d.status] ?? 'default'}>
                              {d.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {d.notes ?? '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {selectedDispute === d.id ? (
                                <>
                                  <Input
                                    placeholder="Resolution..."
                                    value={resolveNotes}
                                    onChange={(e) => setResolveNotes(e.target.value)}
                                    className="h-8 w-32"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      resolveMutation.mutate({
                                        disputeId: d.id,
                                        resolution: resolveNotes,
                                      })
                                      setSelectedDispute(null)
                                      setResolveNotes('')
                                    }}
                                    disabled={!resolveNotes.trim() || resolveMutation.isPending}
                                  >
                                    Resolve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedDispute(null)}
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedDispute(d.id)}
                                  >
                                    Resolve
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      escalateMutation.mutate({
                                        disputeId: d.id,
                                        notes: 'Escalated from admin tools',
                                      })
                                    }
                                    disabled={escalateMutation.isPending}
                                  >
                                    Escalate
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 font-medium">No disputes</p>
                    <p className="text-sm text-muted-foreground">All disputes are resolved</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Billing Exceptions
                </CardTitle>
                <CardDescription>Approve or reject manual billing adjustments</CardDescription>
              </CardHeader>
              <CardContent>
                {billingLoading ? (
                  <Skeleton className="h-32" />
                ) : billingExceptions && billingExceptions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingExceptions.map((b) => (
                        <TableRow key={b.id} className="transition-colors hover:bg-muted/50">
                          <TableCell className="font-medium">{b.account_id}</TableCell>
                          <TableCell>
                            {b.currency} {b.amount}
                          </TableCell>
                          <TableCell className="max-w-[180px] truncate text-muted-foreground">
                            {b.reason}
                          </TableCell>
                          <TableCell>
                            <Badge variant={billingStatusVariant[b.status] ?? 'default'}>
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {b.status === 'pending' && (
                              <div className="flex justify-end gap-1">
                                <Button
                                  size="sm"
                                  onClick={() => approveMutation.mutate(b.id)}
                                  disabled={approveMutation.isPending}
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => rejectMutation.mutate(b.id)}
                                  disabled={rejectMutation.isPending}
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CreditCard className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 font-medium">No billing exceptions</p>
                    <p className="text-sm text-muted-foreground">No pending manual adjustments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="escalations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TicketPlus className="h-5 w-5 text-primary" />
                  Escalations
                </CardTitle>
                <CardDescription>View and manage support escalations</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowCreateEscalation(true)}>
                <TicketPlus className="mr-2 h-4 w-4" />
                Create Escalation
              </Button>
            </CardHeader>
            <CardContent>
              {escalationsLoading ? (
                <Skeleton className="h-48" />
              ) : escalations && escalations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workspace</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escalations.map((e) => (
                      <TableRow key={e.id} className="transition-colors hover:bg-muted/50">
                        <TableCell className="font-medium">{e.workspace_id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{e.reason}</TableCell>
                        <TableCell>
                          <Badge variant={escalationPriorityVariant[e.priority] ?? 'default'}>
                            {e.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={escalationStatusVariant[e.status] ?? 'default'}>
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {e.assigned_team ?? '—'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(e.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <TicketPlus className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 font-medium">No escalations</p>
                  <p className="text-sm text-muted-foreground">Create an escalation to get started</p>
                  <Button className="mt-4" size="sm" onClick={() => setShowCreateEscalation(true)}>
                    Create Escalation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DisableWorkspaceModal
        open={!!disableWorkspace}
        onOpenChange={(open) => !open && setDisableWorkspace(null)}
        workspaceName={disableWorkspace?.name ?? ''}
        workspaceId={disableWorkspace?.id ?? ''}
        onConfirm={(reason) => {
          if (disableWorkspace) {
            disableMutation.mutate({ workspaceId: disableWorkspace.id, reason })
            setDisableWorkspace(null)
          }
        }}
        isLoading={disableMutation.isPending}
      />

      <ExportWorkspaceModal
        open={!!exportWorkspace}
        onOpenChange={(open) => !open && setExportWorkspace(null)}
        workspaceName={exportWorkspace?.name ?? ''}
        workspaceId={exportWorkspace?.id ?? ''}
        onConfirm={() => {
          if (exportWorkspace) {
            exportMutation.mutate(exportWorkspace.id)
            setExportWorkspace(null)
          }
        }}
        isLoading={exportMutation.isPending}
      />

      <RetentionPolicyModal
        open={!!retentionWorkspace}
        onOpenChange={(open) => !open && setRetentionWorkspace(null)}
        workspaceName={retentionWorkspace?.name ?? ''}
        workspaceId={retentionWorkspace?.id ?? ''}
        onConfirm={(policy) => {
          if (retentionWorkspace) {
            retentionMutation.mutate({ workspaceId: retentionWorkspace.id, policy })
            setRetentionWorkspace(null)
          }
        }}
        isLoading={retentionMutation.isPending}
      />

      <CreateEscalationModal
        open={showCreateEscalation}
        onOpenChange={setShowCreateEscalation}
        workspaces={workspaces ?? []}
        onConfirm={(data) => {
          createEscalationMutation.mutate(data)
          setShowCreateEscalation(false)
        }}
        isLoading={createEscalationMutation.isPending}
      />

      <Dialog open={!!forceLogoutUser} onOpenChange={(open) => !open && setForceLogoutUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Force sign-out</DialogTitle>
            <DialogDescription>
              This will sign out {forceLogoutUser?.name ?? forceLogoutUser?.email ?? 'this user'} from all devices. They will need to sign in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForceLogoutUser(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (forceLogoutUser) {
                  forceLogoutMutation.mutate(forceLogoutUser.id)
                  setForceLogoutUser(null)
                }
              }}
              disabled={forceLogoutMutation.isPending}
            >
              {forceLogoutMutation.isPending ? 'Signing out...' : 'Sign out everywhere'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showBulkDisable && (
        <DisableWorkspaceModal
          open={showBulkDisable}
          onOpenChange={(open) => !open && setShowBulkDisable(false)}
          workspaceName={`${selectedWorkspaceIds.size} workspaces`}
          workspaceId="bulk"
          onConfirm={handleBulkDisableConfirm}
          isLoading={bulkDisableMutation.isPending}
        />
      )}
    </div>
  )
}
