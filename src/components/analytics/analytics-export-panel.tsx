/**
 * Export panel - CSV/PDF export and schedule options
 */

import { useState } from 'react'
import { FileDown, CalendarClock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { AnalyticsFilters } from '@/types/analytics'
import { useExportReport, useScheduleReport } from '@/hooks/use-analytics'

export interface AnalyticsExportPanelProps {
  filters: AnalyticsFilters
  onExportComplete?: () => void
  className?: string
}

export function AnalyticsExportPanel({
  filters,
  onExportComplete,
  className,
}: AnalyticsExportPanelProps) {
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleCadence, setScheduleCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly')
  const [scheduleRecipients, setScheduleRecipients] = useState('')
  const [scheduleFormat, setScheduleFormat] = useState<'csv' | 'pdf'>('csv')

  const exportMutation = useExportReport()
  const scheduleMutation = useScheduleReport()

  const handleExport = async (type: 'csv' | 'pdf') => {
    try {
      const result = await exportMutation.mutateAsync({
        type,
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy,
        filters: {},
      })
      toast.success(`Export ready. Download from: ${result.url}`)
      if (type === 'csv') {
        window.open(result.url, '_blank')
      }
      onExportComplete?.()
    } catch {
      toast.error('Export failed. Please try again.')
    }
  }

  const handleSchedule = async () => {
    const recipients = scheduleRecipients
      .split(/[,\s]+/)
      .map((r) => r.trim())
      .filter(Boolean)
    if (recipients.length === 0) {
      toast.error('Please add at least one recipient email')
      return
    }
    try {
      await scheduleMutation.mutateAsync({
        format: scheduleFormat,
        cadence: scheduleCadence,
        recipients,
        from: filters.from,
        to: filters.to,
        groupBy: filters.groupBy,
      })
      toast.success('Report schedule created')
      setScheduleOpen(false)
      setScheduleRecipients('')
      onExportComplete?.()
    } catch {
      toast.error('Failed to schedule report')
    }
  }

  const isExporting = exportMutation.isPending
  const isScheduling = scheduleMutation.isPending

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card', className)}>
      <CardHeader>
        <CardTitle>Export & schedule</CardTitle>
        <p className="text-sm text-muted-foreground">
          Download reports or schedule automated delivery
        </p>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button
          variant="default"
          size="sm"
          onClick={() => handleExport('csv')}
          disabled={isExporting}
          className="rounded-lg"
          aria-label={isExporting ? 'Exporting CSV report' : 'Export analytics as CSV'}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <FileDown className="h-4 w-4" aria-hidden />
          )}
          <span className="ml-2">{isExporting ? 'Exporting…' : 'Export CSV'}</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="rounded-lg"
          aria-label={isExporting ? 'Exporting PDF report' : 'Export analytics as PDF'}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <FileDown className="h-4 w-4" aria-hidden />
          )}
          <span className="ml-2">{isExporting ? 'Exporting…' : 'Export PDF'}</span>
        </Button>

        <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-lg" aria-label="Schedule recurring report">
              <CalendarClock className="h-4 w-4" aria-hidden />
              Schedule report
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Schedule report</DialogTitle>
              <DialogDescription>
                Configure recurring report delivery via email
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="schedule-format">Format</Label>
                <Select value={scheduleFormat} onValueChange={(v) => setScheduleFormat(v as 'csv' | 'pdf')}>
                  <SelectTrigger id="schedule-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-cadence">Cadence</Label>
                <Select value={scheduleCadence} onValueChange={(v) => setScheduleCadence(v as 'daily' | 'weekly' | 'monthly')}>
                  <SelectTrigger id="schedule-cadence">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-recipients">Recipients (comma-separated emails)</Label>
                <Input
                  id="schedule-recipients"
                  type="text"
                  placeholder="email@example.com, other@example.com"
                  value={scheduleRecipients}
                  onChange={(e) => setScheduleRecipients(e.target.value)}
                  className="rounded-lg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setScheduleOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSchedule}
                disabled={isScheduling}
                aria-label={isScheduling ? 'Scheduling report' : 'Confirm schedule'}
              >
                {isScheduling ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                <span className={isScheduling ? 'ml-2' : ''}>{isScheduling ? 'Scheduling…' : 'Schedule'}</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
