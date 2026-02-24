import { Link } from 'react-router-dom'
import {
  FileCheck,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  Share2,
  Link2,
  Link2Off,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { DecisionListItem } from '@/types/decisions-list'

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  accepted: 'success', // DB uses accepted, map to approved in UI
  rejected: 'destructive',
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending: 'Pending',
  approved: 'Approved',
  accepted: 'Approved',
  rejected: 'Rejected',
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return formatDate(dateStr)
}

export interface DecisionsTableProps {
  decisions: DecisionListItem[]
  projectId: string
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  onSelectAll: (checked: boolean) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onShare: (id: string) => void
  onPreview: (id: string | null) => void
  isAllSelected?: boolean
  className?: string
}

export function DecisionsTable({
  decisions,
  projectId,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  onDuplicate,
  onDelete,
  onShare,
  onPreview,
  isAllSelected = false,
  className,
}: DecisionsTableProps) {
  const toggleSelect = (id: string, checked: boolean) => {
    const next = new Set(selectedIds)
    if (checked) next.add(id)
    else next.delete(id)
    onSelectionChange(next)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(new Set(decisions.map((d) => d.id)))
    } else {
      onSelectionChange(new Set())
    }
    onSelectAll(checked)
  }

  if (decisions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileCheck className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-medium">No decisions found</p>
          <p className="text-sm text-muted-foreground">
            Create your first decision or adjust your filters.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Desktop: Table */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-12 pr-0">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={(c) => handleSelectAll(!!c)}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="font-medium">Title</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium">Due date</TableHead>
              <TableHead className="font-medium">Files</TableHead>
              <TableHead className="font-medium">Share link</TableHead>
              <TableHead className="font-medium">Updated</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {decisions.map((decision) => (
              <TableRow
                key={decision.id}
                className="cursor-pointer transition-colors hover:bg-secondary/50"
                onClick={() => onPreview(decision.id)}
              >
                <TableCell className="pr-0" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(decision.id)}
                    onCheckedChange={(c) => toggleSelect(decision.id, !!c)}
                    aria-label={`Select ${decision.title}`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    to={`/dashboard/projects/${projectId}/decisions/${decision.id}/internal`}
                    className="font-medium text-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {decision.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[decision.status] ?? 'default'}>
                    {STATUS_LABEL[decision.status] ?? decision.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(decision.due_date)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {decision.files_count ?? 0}
                </TableCell>
                <TableCell>
                  {decision.has_share_link ? (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 text-xs',
                        decision.share_link_status === 'active'
                          ? 'text-success'
                          : 'text-muted-foreground'
                      )}
                    >
                      {decision.share_link_status === 'active' ? (
                        <Link2 className="h-3.5 w-3.5" />
                      ) : (
                        <Link2Off className="h-3.5 w-3.5" />
                      )}
                      {decision.share_link_status === 'active' ? 'Active' : 'Expired'}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatRelative(decision.updated_at)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/dashboard/projects/${projectId}/decisions/${decision.id}/edit`}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(decision.id)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShare(decision.id)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share link
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(decision.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {decisions.map((decision) => (
          <Card
            key={decision.id}
            className="transition-all duration-200 hover:shadow-card-hover cursor-pointer"
            onClick={() => onPreview(decision.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="pt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.has(decision.id)}
                    onCheckedChange={(c) => toggleSelect(decision.id, !!c)}
                    aria-label={`Select ${decision.title}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/dashboard/projects/${projectId}/decisions/${decision.id}/internal`}
                      className="font-medium text-foreground hover:text-primary"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {decision.title}
                    </Link>
                    <Badge variant={STATUS_VARIANT[decision.status] ?? 'default'}>
                      {STATUS_LABEL[decision.status] ?? decision.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>Due: {formatDate(decision.due_date)}</span>
                    <span>{decision.files_count ?? 0} files</span>
                    <span>{formatRelative(decision.updated_at)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        to={`/dashboard/projects/${projectId}/decisions/${decision.id}/edit`}
                      >
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation()
                        onShare(decision.id)
                      }}
                      aria-label="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
