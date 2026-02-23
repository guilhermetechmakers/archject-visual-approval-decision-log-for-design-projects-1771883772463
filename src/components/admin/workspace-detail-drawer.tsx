/**
 * Workspace Detail Drawer - right-side panel with workspace details and actions.
 */

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  UserCog,
  Download,
  Database,
  AlertCircle,
  Ban,
} from 'lucide-react'
import type { Workspace } from '@/types/admin'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  active: 'success',
  suspended: 'destructive',
  archived: 'warning',
  disabled: 'destructive',
  pending: 'warning',
}

interface WorkspaceDetailDrawerProps {
  workspace: Workspace | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onImpersonate: (w: Workspace) => void
  onDisable: (w: Workspace) => void
  onExport: (w: Workspace) => void
  onRetention: (w: Workspace) => void
  onEscalate: (w: Workspace) => void
}

function formatDate(s: string) {
  return new Date(s).toLocaleString()
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

export function WorkspaceDetailDrawer({
  workspace,
  open,
  onOpenChange,
  onImpersonate,
  onDisable,
  onExport,
  onRetention,
  onEscalate,
}: WorkspaceDetailDrawerProps) {
  if (!workspace) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{workspace.name}</SheetTitle>
          <SheetDescription>
            Workspace ID: {workspace.id}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Owner</h4>
            <div className="flex items-center gap-3 rounded-lg border border-border p-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {getInitials(workspace.owner_name, workspace.owner_email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{workspace.owner_name ?? workspace.owner_email ?? '—'}</p>
                <p className="text-sm text-muted-foreground">{workspace.owner_email ?? '—'}</p>
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Details</h4>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium capitalize">{workspace.plan}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={statusVariant[workspace.status] ?? 'default'}>
                    {workspace.status}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Domain</dt>
                <dd className="font-medium">{workspace.domain ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last Activity</dt>
                <dd>{formatDate(workspace.last_activity)}</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Actions</h4>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => onImpersonate(workspace)}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Impersonate
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => onEscalate(workspace)}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Create Escalation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => onExport(workspace)}
              >
                <Download className="mr-2 h-4 w-4" />
                Force Data Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="justify-start"
                onClick={() => onRetention(workspace)}
              >
                <Database className="mr-2 h-4 w-4" />
                Set Retention Policy
              </Button>
              {workspace.status !== 'disabled' && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="justify-start"
                  onClick={() => onDisable(workspace)}
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Disable Workspace
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
