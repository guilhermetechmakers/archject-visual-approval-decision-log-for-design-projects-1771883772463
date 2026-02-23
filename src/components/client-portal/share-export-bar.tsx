import { Download, Printer, Share2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ShareExportBarProps {
  linkExpiresAt?: string | null
  onExportPdf?: () => void
  onExportJson?: () => void
  onPrint?: () => void
  onShare?: () => void
  isExporting?: boolean
  className?: string
}

export function ShareExportBar({
  linkExpiresAt,
  onExportPdf,
  onExportJson,
  onPrint,
  onShare,
  isExporting = false,
  className,
}: ShareExportBarProps) {
  const expiryText = linkExpiresAt
    ? `Link expires ${new Date(linkExpiresAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`
    : null

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
        'flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-card',
        className
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {linkExpiresAt && (
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {expiryText}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onExportPdf && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportPdf}
            disabled={isExporting}
            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        )}
        {onExportJson && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExportJson}
            disabled={isExporting}
            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            <Download className="mr-2 h-4 w-4" />
            Export JSON
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        {onShare && (
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}
      </div>
    </div>
  )
}
