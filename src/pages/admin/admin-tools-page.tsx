/**
 * Admin Tools & Moderation - user/workspace management, billing, disputes.
 */

import * as React from 'react'
import { UserMinus, UserCheck, Building2, CreditCard, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  useAdminDisputes,
  useAdminBillingExceptions,
  useDisputeResolve,
  useDisputeEscalate,
  useBillingExceptionApprove,
  useBillingExceptionReject,
} from '@/hooks/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
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

export function AdminToolsPage() {
  const [resolveNotes, setResolveNotes] = React.useState('')
  const [selectedDispute, setSelectedDispute] = React.useState<string | null>(null)

  const { data: disputes, isLoading: disputesLoading } = useAdminDisputes()
  const { data: billingExceptions, isLoading: billingLoading } = useAdminBillingExceptions()

  const resolveMutation = useDisputeResolve()
  const escalateMutation = useDisputeEscalate()
  const approveMutation = useBillingExceptionApprove()
  const rejectMutation = useBillingExceptionReject()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Tools & Moderation</h1>
        <p className="mt-1 text-muted-foreground">
          User management, workspace management, billing exceptions, disputes, support escalations
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Disputes */}
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

        {/* Billing Exceptions */}
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
                <p className="text-sm text-muted-foreground">
                  No pending manual adjustments
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User & Workspace Management placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-primary" />
            User & Workspace Management
          </CardTitle>
          <CardDescription>
            Suspend/activate users, merge/split workspaces, rename workspaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm">
              <UserMinus className="mr-2 h-4 w-4" />
              Suspend user
            </Button>
            <Button variant="outline" size="sm">
              <UserCheck className="mr-2 h-4 w-4" />
              Activate user
            </Button>
            <Button variant="outline" size="sm">
              <Building2 className="mr-2 h-4 w-4" />
              Manage workspace
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Use the User Management page for workspace-level actions. User suspend/activate
            will be available when connected to the user API.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
