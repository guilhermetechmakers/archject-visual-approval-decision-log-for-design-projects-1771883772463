import { useState } from 'react'
import { Download, FileText, FileSpreadsheet, FileJson } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useExportBilling } from '@/hooks/use-billing'

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)
  const exportBilling = useExportBilling()

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
          disabled={isExporting || exportBilling.isPending}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileJson className="h-4 w-4" />
          Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
