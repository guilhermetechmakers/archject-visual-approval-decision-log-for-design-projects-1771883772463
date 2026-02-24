/**
 * Admin Retention Policies - per-workspace retention settings.
 */

import * as React from 'react'
import { Archive, Trash2, Shield, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useRetentionPolicies,
  useCreateRetentionPolicy,
  useDeleteRetentionPolicy,
} from '@/hooks/use-governance'
import { CreateRetentionPolicyModal } from '@/components/admin/create-retention-policy-modal'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function formatDays(days: number) {
  if (days === 0) return 'Indefinite (legal hold)'
  if (days < 30) return `${days} days`
  if (days < 365) return `${Math.round(days / 30)} months`
  return `${(days / 365).toFixed(1)} years`
}

export function AdminRetentionPoliciesPage() {
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const { data: policies, isLoading, error, refetch } = useRetentionPolicies()
  const createMutation = useCreateRetentionPolicy()
  const deleteMutation = useDeleteRetentionPolicy()

  const handleCreate = async (data: {
    workspace_id: string
    policy_name: string
    mode: 'archive' | 'delete'
    duration_days: number
    legal_hold?: boolean
  }) => {
    try {
      await createMutation.mutateAsync(data)
      toast.success('Retention policy created')
      setCreateModalOpen(false)
    } catch {
      toast.error('Failed to create retention policy')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Retention policy deleted')
    } catch {
      toast.error('Failed to delete retention policy')
    }
  }

  const items = policies ?? []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Retention policies</h1>
          <p className="mt-1 text-muted-foreground">
            Per-workspace retention settings with auto-archiving and deletion
          </p>
        </div>
        <Button
          className="rounded-full transition-all duration-200 hover:scale-[1.02]"
          onClick={() => setCreateModalOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Configure retention policy
        </Button>
      </div>

      <Card className="overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-base">
            <Archive className="h-5 w-5 text-primary" />
            Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Archive className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Failed to load retention policies</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Archive className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">No retention policies configured</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setCreateModalOpen(true)}
              >
                Create first policy
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map((policy: import('@/types/governance').RetentionPolicy) => (
                <div
                  key={policy.id}
                  className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    {policy.legal_hold ? (
                      <Shield className="h-5 w-5 text-warning" />
                    ) : policy.mode === 'archive' ? (
                      <Archive className="h-5 w-5 text-primary" />
                    ) : (
                      <Trash2 className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{policy.policy_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Workspace {policy.workspace_id} · {policy.mode} ·{' '}
                        {formatDays(policy.duration_days)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {policy.legal_hold && (
                      <Badge className="bg-warning/20 text-warning">Legal hold</Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={cn(
                        policy.mode === 'archive' && 'border-primary/50 text-primary',
                        policy.mode === 'delete' && 'border-destructive/50 text-destructive'
                      )}
                    >
                      {policy.mode}
                    </Badge>
                    {!policy.legal_hold && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(policy.id)}
                        disabled={deleteMutation.isPending}
                        aria-label="Delete policy"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateRetentionPolicyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </div>
  )
}
