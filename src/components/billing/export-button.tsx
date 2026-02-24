import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useExportBilling } from '@/hooks/use-billing'

interface ExportButtonProps {
  /** Accessible label for the export trigger button */
  'aria-label'?: string
}

export function ExportButton({ 'aria-label': ariaLabel = 'Export billing data' }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const exportBilling = useExportBilling()
  const isPending = isExporting || exportBilling.isPending

  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    setIsExporting(true)
    try {
      const result = await exportBilling.mutateAsync(format)
      if (result?.download_url) {
        window.open(result.download_url, '_blank')
        toast.success(`Invoices exported as ${format.toUpperCase()}`)
      } else if (format === 'json' && result?.data) {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: 'application/json',
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `billing-export-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Invoices exported as JSON')
      } else {
        toast.success('Export initiated. Download will start when backend is configured.')
      }
    } catch {
      toast.error('Export failed. Configure the billing export endpoint.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          aria-label={isPending ? 'Exporting billing data' : ariaLabel}
          aria-busy={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" aria-label="Export format options">
        <DropdownMenuItem onClick={() => handleExport('pdf')} aria-label="Export as PDF">
          <FileText className="h-4 w-4" aria-hidden />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} aria-label="Export as CSV">
          <FileSpreadsheet className="h-4 w-4" aria-hidden />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')} aria-label="Export as JSON">
          <FileJson className="h-4 w-4" aria-hidden />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
