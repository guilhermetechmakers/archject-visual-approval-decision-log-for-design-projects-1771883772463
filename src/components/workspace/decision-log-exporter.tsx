import { FileDown, FileText, FileSpreadsheet, Braces } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DecisionLogExporterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  onExport: (type: 'pdf' | 'csv' | 'json') => void
  isExporting?: boolean
}

const exportOptions = [
  {
    type: 'pdf' as const,
    label: 'PDF',
    description: 'Human-readable report with structured layout',
    icon: FileText,
  },
  {
    type: 'csv' as const,
    label: 'CSV',
    description: 'Spreadsheet format for data analysis',
    icon: FileSpreadsheet,
  },
  {
    type: 'json' as const,
    label: 'JSON',
    description: 'Machine-readable for integrations',
    icon: Braces,
  },
]

export function DecisionLogExporter({
  open,
  onOpenChange,
  projectId: _projectId,
  onExport,
  isExporting = false,
}: DecisionLogExporterProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Decision Log</DialogTitle>
          <DialogDescription>
            Export decisions, options, comments, approvals, and file references.
            Choose your preferred format.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {exportOptions.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => {
                  onExport(opt.type)
                  onOpenChange(false)
                }}
                disabled={isExporting}
                className={cn(
                  'flex items-start gap-4 rounded-xl border border-border p-4 text-left transition-all',
                  'hover:border-primary/50 hover:bg-secondary/30',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
                <FileDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              </button>
            )
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
