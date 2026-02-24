/**
 * Dashboard export - export current view as PDF/CSV, shareable link
 */

import { FileDown, Share2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useExportReport } from '@/hooks/use-analytics'

export interface DashboardExportBarProps {
  filters?: { from: string; to: string }
  workspaceId?: string | null
  className?: string
}

export function DashboardExportBar({
  filters,
  className,
}: DashboardExportBarProps) {
  const exportMutation = useExportReport()

  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 30)
  const defaultFrom = start.toISOString().slice(0, 10)
  const defaultTo = now.toISOString().slice(0, 10)
  const from = filters?.from ?? defaultFrom
  const to = filters?.to ?? defaultTo

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      const result = await exportMutation.mutateAsync({
        type: format,
        from,
        to,
        filters: { scope: 'dashboard' },
      })
      if (result?.url) {
        window.open(result.url, '_blank')
        toast.success(`${format.toUpperCase()} export ready`)
      } else {
        toast.success('Export requested. Check your email or downloads.')
      }
    } catch {
      toast.error('Export failed. Please try again.')
    }
  }

  const handleShareLink = () => {
    const url = `${window.location.origin}/dashboard?from=${from}&to=${to}`
    navigator.clipboard.writeText(url).then(
      () => toast.success('Dashboard link copied to clipboard'),
      () => toast.error('Failed to copy link')
    )
  }

  const isExporting = exportMutation.isPending

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={isExporting}
            aria-label="Export dashboard"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem
            onClick={() => handleExport('csv')}
            className="rounded-lg cursor-pointer"
          >
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport('pdf')}
            className="rounded-lg cursor-pointer"
          >
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="outline"
        size="sm"
        className="rounded-lg"
        onClick={handleShareLink}
        aria-label="Copy shareable link"
      >
        <Share2 className="h-4 w-4" />
        Share link
      </Button>
    </div>
  )
}
