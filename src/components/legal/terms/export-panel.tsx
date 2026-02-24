import { Button } from '@/components/ui/button'
import { FileDown, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ExportPanelProps {
  onExportPdf: () => void
  onExport?: () => void
  onPrint?: () => void
  isExporting?: boolean
  className?: string
}

export function ExportPanel({
  onExportPdf,
  onExport,
  onPrint,
  isExporting = false,
  className,
}: ExportPanelProps) {
  const handleExport = onExport ?? onExportPdf
  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-card',
        className
      )}
    >
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Export & Print
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
          aria-label="Export Terms of Service as PDF"
        >
          <FileDown className="h-4 w-4" aria-hidden />
          {isExporting ? 'Exporting...' : 'Export PDF'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
          aria-label="Print Terms of Service"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print
        </Button>
      </div>
    </div>
  )
}
