/**
 * Compliance Export Modal - manual data export with scope selection.
 * Supports CSV, JSON, PDF-ready formats for compliance requests.
 * Design: Archject design system (shadow-card, design tokens, 8px spacing).
 */

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const EXPORT_SCOPES = [
  { value: 'users', label: 'Users' },
  { value: 'workspaces', label: 'Workspaces' },
  { value: 'audit_logs', label: 'Audit Logs' },
  { value: 'all', label: 'All (Full Export)' },
] as const

const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'pdf', label: 'PDF-ready bundle' },
] as const

interface ComplianceExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (scope: string, format: string) => void
  isLoading?: boolean
  /** Optional error message to display inline (e.g. when export fails) */
  error?: string | null
}

export function ComplianceExportModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  error = null,
}: ComplianceExportModalProps) {
  const [scope, setScope] = React.useState<string>('audit_logs')
  const [format, setFormat] = React.useState<string>('json')

  const handleConfirm = () => {
    onConfirm(scope, format)
    onOpenChange(false)
    setScope('audit_logs')
    setFormat('json')
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setScope('audit_logs')
      setFormat('json')
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          'max-w-lg shadow-card animate-fade-in sm:max-w-md',
          'p-6 sm:p-8'
        )}
        aria-labelledby="compliance-export-title"
        aria-describedby="compliance-export-description"
      >
        <DialogHeader className="text-left">
          <DialogTitle
            id="compliance-export-title"
            className="flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <Download className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            Compliance Export
          </DialogTitle>
          <DialogDescription
            id="compliance-export-description"
            className="text-sm text-muted-foreground"
          >
            Generate a controlled data export for compliance requests. Select scope and format.
            Export activity is logged and access-controlled.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="export-scope" className="text-foreground">
              Data Scope
            </Label>
            <Select value={scope} onValueChange={setScope} disabled={isLoading}>
              <SelectTrigger
                id="export-scope"
                aria-label="Select data scope for export (Users, Workspaces, Audit Logs, or All)"
              >
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_SCOPES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-format" className="text-foreground">
              Format
            </Label>
            <Select value={format} onValueChange={setFormat} disabled={isLoading}>
              <SelectTrigger
                id="export-format"
                aria-label="Select export format (CSV, JSON, or PDF-ready bundle)"
              >
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              aria-live="assertive"
            >
              {error}
            </div>
          ) : null}
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
            aria-label="Cancel and close dialog"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            aria-label={isLoading ? 'Generating export' : 'Generate compliance export'}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" aria-hidden />
            ) : null}
            {isLoading ? 'Generating...' : 'Generate Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
