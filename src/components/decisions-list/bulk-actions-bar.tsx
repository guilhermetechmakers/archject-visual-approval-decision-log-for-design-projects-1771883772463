import { useState } from 'react'
import {
  FileDown,
  Share2,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { DecisionStatus } from '@/types/workspace'

const STATUS_OPTIONS: { value: DecisionStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

const EXPORT_FORMATS = [
  { value: 'pdf' as const, label: 'PDF' },
  { value: 'csv' as const, label: 'CSV' },
  { value: 'json' as const, label: 'JSON' },
]

export interface BulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onExport: (format: 'pdf' | 'csv' | 'json') => void
  onShare: () => void
  onChangeStatus: (newStatus: DecisionStatus) => void
  onDelete: () => void
  isExporting?: boolean
  isSharing?: boolean
  isChangingStatus?: boolean
  isDeleting?: boolean
  className?: string
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onExport,
  onShare,
  onChangeStatus,
  onDelete,
  isExporting = false,
  isSharing = false,
  isChangingStatus = false,
  isDeleting = false,
  className,
}: BulkActionsBarProps) {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf')
  const [statusModalOpen, setStatusModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<DecisionStatus>('pending')

  if (selectedCount === 0) return null

  const handleExport = () => {
    onExport(exportFormat)
  }

  const handleChangeStatus = () => {
    onChangeStatus(newStatus)
    setStatusModalOpen(false)
  }

  const handleDelete = () => {
    onDelete()
    setDeleteModalOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          'flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-card animate-fade-in',
          className
        )}
        role="toolbar"
        aria-label="Bulk actions"
      >
        <span className="text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={exportFormat}
            onValueChange={(v) => setExportFormat(v as 'pdf' | 'csv' | 'json')}
          >
            <SelectTrigger className="w-[100px] h-8" aria-label="Export format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EXPORT_FORMATS.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
            aria-label="Export selected"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            disabled={isSharing}
            aria-label="Share links"
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? 'Creating...' : 'Share links'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatusModalOpen(true)}
            disabled={isChangingStatus}
            aria-label="Change status"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Change status
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setDeleteModalOpen(true)}
            disabled={isDeleting}
            aria-label="Delete selected"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="ml-auto"
          aria-label="Clear selection"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      </div>

      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change status</DialogTitle>
            <DialogDescription>
              Update the status of {selectedCount} selected decision(s).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select
              value={newStatus}
              onValueChange={(v) => setNewStatus(v as DecisionStatus)}
            >
              <SelectTrigger aria-label="New status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangeStatus} disabled={isChangingStatus}>
              {isChangingStatus ? 'Updating...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete decisions</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} decision(s)? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
