/**
 * SearchBulkActionsBar - sticky bar for bulk export, share, status change
 */

import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface SearchBulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onExport: (format: 'csv' | 'json' | 'pdf') => void
  isExporting?: boolean
  className?: string
}

export function SearchBulkActionsBar({
  selectedCount,
  onClearSelection,
  onExport,
  isExporting = false,
  className,
}: SearchBulkActionsBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-card',
        className
      )}
    >
      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('csv')}
          disabled={isExporting}
          className="rounded-full"
        >
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('json')}
          disabled={isExporting}
          className="rounded-full"
        >
          Export JSON
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport('pdf')}
          disabled={isExporting}
          className="rounded-full"
        >
          Export PDF
        </Button>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="ml-auto text-muted-foreground"
      >
        <X className="mr-1 h-4 w-4" />
        Clear
      </Button>
    </div>
  )
}
