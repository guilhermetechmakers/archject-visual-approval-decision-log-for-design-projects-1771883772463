/**
 * Retention Policies Panel - list, create, edit policies.
 */

import * as React from 'react'
import { Database, Plus, Shield, Trash2, Pencil, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  useRetentionPolicies,
  useCreateRetentionPolicy,
  useUpdateRetentionPolicy,
  useDeleteRetentionPolicy,
  useGovernanceWorkspaces,
} from '@/hooks/use-governance'
import type { RetentionPolicy } from '@/types/governance'
import { cn } from '@/lib/utils'

function PolicyCard({
  policy,
  onEdit,
  onDelete,
  isDeleting,
}: {
  policy: RetentionPolicy
  onEdit: () => void
  onDelete: () => void
  isDeleting: boolean
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4 transition-all duration-200 hover:shadow-card hover:border-primary/20">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Database className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-medium">{policy.policy_name}</p>
          <p className="text-sm text-muted-foreground">
            {policy.mode === 'archive' ? 'Archive' : 'Delete'} after {policy.duration_days} days
            {policy.legal_hold && ' · Legal hold active'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={policy.mode === 'archive' ? 'secondary' : 'destructive'} className="rounded-full">
          {policy.mode}
        </Badge>
        {policy.legal_hold && (
          <Badge className="rounded-full bg-warning/20 text-warning">
            <Shield className="mr-1 h-3 w-3" />
            Legal hold
          </Badge>
        )}
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Edit policy">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={isDeleting || policy.legal_hold}
          aria-label="Delete policy"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

interface RetentionPolicyFormProps {
  policy?: RetentionPolicy | null
  onSubmit: (data: {
    policy_name: string
    mode: 'archive' | 'delete'
    duration_days: number
    schedule_cron?: string
    legal_hold: boolean
  }) => void
  onCancel: () => void
  isLoading?: boolean
}

function RetentionPolicyForm({
  policy,
  onSubmit,
  onCancel,
  isLoading,
}: RetentionPolicyFormProps) {
  const [policyName, setPolicyName] = React.useState(policy?.policy_name ?? '')
  const [mode, setMode] = React.useState<'archive' | 'delete'>(policy?.mode ?? 'archive')
  const [durationDays, setDurationDays] = React.useState(String(policy?.duration_days ?? 365))
  const [legalHold, setLegalHold] = React.useState(policy?.legal_hold ?? false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const days = parseInt(durationDays, 10)
    if (isNaN(days) || days < 0) return
    onSubmit({ policy_name: policyName, mode, duration_days: days, legal_hold: legalHold })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="policy-name">Policy name</Label>
        <Input
          id="policy-name"
          value={policyName}
          onChange={(e) => setPolicyName(e.target.value)}
          placeholder="e.g. Default audit retention"
          className="rounded-lg bg-input"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="policy-mode">Mode</Label>
        <Select value={mode} onValueChange={(v) => setMode(v as 'archive' | 'delete')}>
          <SelectTrigger id="policy-mode" className="rounded-lg bg-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="archive">Archive</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="policy-duration">Duration (days)</Label>
        <Input
          id="policy-duration"
          type="number"
          min={0}
          value={durationDays}
          onChange={(e) => setDurationDays(e.target.value)}
          className="rounded-lg bg-input"
          required
        />
      </div>
      <div className="flex items-center gap-2">
        <Switch id="legal-hold" checked={legalHold} onCheckedChange={setLegalHold} />
        <Label htmlFor="legal-hold" className="cursor-pointer">Legal hold</Label>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          aria-label="Cancel and close form"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!policyName || !durationDays || isLoading}
          aria-label={isLoading ? 'Saving retention policy' : policy ? 'Update retention policy' : 'Create retention policy'}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          {isLoading ? 'Saving…' : policy ? 'Update' : 'Create'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export interface RetentionPoliciesPanelProps {
  workspaceId?: string
  className?: string
}

export function RetentionPoliciesPanel({ workspaceId, className }: RetentionPoliciesPanelProps) {
  const [formOpen, setFormOpen] = React.useState(false)
  const [editingPolicy, setEditingPolicy] = React.useState<RetentionPolicy | null>(null)

  const { data: policies, isLoading } = useRetentionPolicies(workspaceId)
  const { data: workspaces } = useGovernanceWorkspaces()
  const createMutation = useCreateRetentionPolicy()
  const updateMutation = useUpdateRetentionPolicy()
  const deleteMutation = useDeleteRetentionPolicy()

  const formWorkspaceId = editingPolicy?.workspace_id ?? workspaceId ?? workspaces?.[0]?.id ?? ''

  const handleSubmit = (data: {
    policy_name: string
    mode: 'archive' | 'delete'
    duration_days: number
    schedule_cron?: string
    legal_hold: boolean
  }) => {
    if (editingPolicy) {
      updateMutation.mutate(
        { id: editingPolicy.id, data },
        {
          onSuccess: () => {
            setFormOpen(false)
            setEditingPolicy(null)
          },
        }
      )
    } else {
      createMutation.mutate(
        { workspace_id: formWorkspaceId, ...data },
        {
          onSuccess: () => {
            setFormOpen(false)
          },
        }
      )
    }
  }

  const handleDelete = (policy: RetentionPolicy) => {
    if (policy.legal_hold) return
    if (window.confirm(`Delete policy "${policy.policy_name}"?`)) {
      deleteMutation.mutate(policy.id)
    }
  }

  return (
    <>
      <Card className={cn('overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover', className)}>
        <CardHeader className="flex flex-row items-center justify-between border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Database className="h-5 w-5 text-primary" />
            Retention Policies
          </CardTitle>
          <Button
            size="sm"
            className="rounded-full"
            onClick={() => { setEditingPolicy(null); setFormOpen(true) }}
            aria-label="Add new retention policy"
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden />
            Add policy
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : !policies?.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Database className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No retention policies</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setFormOpen(true)}
                aria-label="Create first retention policy"
              >
                Create first policy
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {policies.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  onEdit={() => { setEditingPolicy(policy); setFormOpen(true) }}
                  onDelete={() => handleDelete(policy)}
                  isDeleting={deleteMutation.isPending}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPolicy ? 'Edit retention policy' : 'Create retention policy'}</DialogTitle>
            <DialogDescription>
              {editingPolicy
                ? 'Update the retention policy settings.'
                : 'Configure data retention for a workspace. Data older than the duration may be archived or deleted.'}
            </DialogDescription>
          </DialogHeader>
          <RetentionPolicyForm
            policy={editingPolicy}
            onSubmit={handleSubmit}
            onCancel={() => { setFormOpen(false); setEditingPolicy(null) }}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
