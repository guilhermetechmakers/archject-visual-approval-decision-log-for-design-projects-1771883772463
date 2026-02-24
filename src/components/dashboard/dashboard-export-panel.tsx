/**
 * Dashboard export panel - export current dashboard view as PDF/CSV
 */

import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
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

export interface DashboardExportPanelProps {
  workspaceId?: string | null
  onExportComplete?: () => void
  className?: string
}

function getDefaultDateRange(): { from: string; to: string } {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 30)
  return {
    from: start.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
  }
}

export function DashboardExportPanel({
  workspaceId,
  onExportComplete,
  className,
}: DashboardExportPanelProps) {
  const [dateRange] = useState(getDefaultDateRange)
  const exportMutation = useExportReport()

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const result = await exportMutation.mutateAsync({
        type,
        from: dateRange.from,
        to: dateRange.to,
        filters: { scope: 'dashboard', workspaceId: workspaceId ?? undefined },
      })
      toast.success('Export ready')
      if (type === 'csv') {
        window.open(result.url, '_blank')
      }
      onExportComplete?.()
    } catch {
      toast.error('Export failed. Please try again.')
    }
  }

  const isExporting = exportMutation.isPending

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('rounded-lg transition-all hover:scale-[1.02] active:scale-[0.98]', className)}
          disabled={isExporting}
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
        <DropdownMenuItem onClick={() => handleExport('csv')} disabled={isExporting}>
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} disabled={isExporting}>
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
