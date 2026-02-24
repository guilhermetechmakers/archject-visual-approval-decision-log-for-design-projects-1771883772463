/**
 * BulkActionsBar - sticky bar for share, export, status changes
 * Shown when rows are selected
 */

import { Download, Share2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface SearchBulkActionsBarProps {
  selectedCount: number
  onClearSelection: () => void
  onExport?: (format: 'csv' | 'json' | 'pdf') => void
  onShare?: () => void
  isExporting?: boolean
  isSharing?: boolean
  className?: string
}

export function SearchBulkActionsBar({
  selectedCount,
  onClearSelection,
  onExport,
  onShare,
  isExporting = false,
  isSharing = false,
  className,
}: SearchBulkActionsBarProps) {
  return (
    <div
      className={cn(
        'sticky top-0 z-10 flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-card animate-fade-in',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">
          {selectedCount} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-muted-foreground"
          onClick={onClearSelection}
          aria-label="Clear selection"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {onExport && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={isExporting}
              >
                <Download className="mr-2 h-4 w-4" />
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport('csv')}>CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('json')}>JSON</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport('pdf')}>PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full"
            onClick={onShare}
            disabled={isSharing}
          >
            <Share2 className="mr-2 h-4 w-4" />
            {isSharing ? 'Sharing...' : 'Share'}
          </Button>
        )}
      </div>
    </div>
  )
}
