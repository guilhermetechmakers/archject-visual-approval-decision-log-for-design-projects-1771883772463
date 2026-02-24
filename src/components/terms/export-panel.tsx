import { Button } from '@/components/ui/button'
import { FileDown, Loader2, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ExportPanelProps {
  onExport: () => void
  isExporting: boolean
  className?: string
}

export function ExportPanel({
  onExport,
  isExporting,
  className,
}: ExportPanelProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-card print:hidden',
        className
      )}
    >
      <h3 className="mb-2 text-sm font-semibold text-foreground">
        Export document
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Download or print this document for your records.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={onExport}
          disabled={isExporting}
          className="gap-2"
          aria-label="Export Terms of Service as PDF"
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <FileDown className="h-4 w-4" aria-hidden />
          )}
          {isExporting ? 'Exporting...' : 'Export to PDF'}
        </Button>
        <Button
          variant="outline"
          onClick={handlePrint}
          className="gap-2"
          aria-label="Print Terms of Service"
        >
          <Printer className="h-4 w-4" aria-hidden />
          Print
        </Button>
      </div>
    </div>
  )
}
