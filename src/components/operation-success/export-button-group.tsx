/**
 * ExportButtonGroup - PDF, CSV, JSON export buttons with tooltips and loading states.
 */

import { FileText, FileSpreadsheet, Braces, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type ExportFormat = 'PDF' | 'CSV' | 'JSON'

const FORMAT_CONFIG: Record<
  ExportFormat,
  { label: string; icon: typeof FileText; tooltip: string }
> = {
  PDF: {
    label: 'PDF',
    icon: FileText,
    tooltip: 'Human-readable report with decisions, options, approvals, and attachment references',
  },
  CSV: {
    label: 'CSV',
    icon: FileSpreadsheet,
    tooltip: 'Spreadsheet format for data analysis and integrations',
  },
  JSON: {
    label: 'JSON',
    icon: Braces,
    tooltip: 'Machine-readable format for APIs and automation',
  },
}

export interface ExportButtonGroupProps {
  formats?: ExportFormat[]
  onExport: (format: ExportFormat) => void | Promise<void>
  loadingFormat?: ExportFormat | null
  disabled?: boolean
  className?: string
}

export function ExportButtonGroup({
  formats = ['PDF', 'CSV', 'JSON'],
  onExport,
  loadingFormat = null,
  disabled = false,
  className,
}: ExportButtonGroupProps) {
  return (
    <TooltipProvider>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {formats.map((format) => {
          const config = FORMAT_CONFIG[format]
          const Icon = config.icon
          const isLoading = loadingFormat === format

          return (
            <Tooltip key={format}>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(format)}
                  disabled={disabled || isLoading}
                  className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
                  aria-label={`Export as ${format}`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <Icon className="h-4 w-4" aria-hidden />
                  )}
                  {config.label}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[240px]">
                {config.tooltip}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
