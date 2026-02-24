/**
 * Compliance Export Modal - manual data export with scope selection.
 * Supports CSV, JSON, PDF-ready formats for compliance requests.
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
import { Download } from 'lucide-react'

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
}

export function ComplianceExportModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Compliance Export
          </DialogTitle>
          <DialogDescription>
            Generate a controlled data export for compliance requests. Select scope and format.
            Export activity is logged and access-controlled.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="export-scope">Data Scope</Label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger id="export-scope">
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
            <Label htmlFor="export-format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="export-format">
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Export'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
