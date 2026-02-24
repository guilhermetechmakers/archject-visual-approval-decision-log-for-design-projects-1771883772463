import { useState } from 'react'
import { Download, FileArchive, Loader2, CheckCircle, Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSettingsDataExports, useCreateDataExport } from '@/hooks/use-settings'
import { useRequestNotificationExport } from '@/hooks/use-notifications'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function DataExportCard() {
  const { data: exports, isLoading } = useSettingsDataExports()
  const createMutation = useCreateDataExport()
  const notificationExportMutation = useRequestNotificationExport()
  const [notifFormat, setNotifFormat] = useState<'json' | 'csv'>('json')
  const [notifDateFrom, setNotifDateFrom] = useState('')
  const [notifDateTo, setNotifDateTo] = useState('')

  const handleRequestExport = async () => {
    try {
      await createMutation.mutateAsync()
      toast.success('Export requested. You will be notified when it is ready.')
    } catch {
      toast.error('Failed to request export')
    }
  }

  const handleNotificationExport = async () => {
    try {
      await notificationExportMutation.mutateAsync({
        format: notifFormat,
        dateFrom: notifDateFrom || undefined,
        dateTo: notifDateTo || undefined,
      })
    } catch {
      // toast handled in mutation
    }
  }

  if (isLoading) return null

  const items = exports ?? []

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/20 text-warning',
    processing: 'bg-primary/20 text-primary',
    completed: 'bg-success/20 text-success',
    failed: 'bg-destructive/20 text-destructive',
  }

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle>Data export & retention</CardTitle>
          </div>
          <CardDescription>
            Export workspace data, decisions, templates, and audit logs. Data residency options available.
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleRequestExport}
            disabled={createMutation.isPending}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileArchive className="mr-2 h-4 w-4" />
          )}
            Request data export
          </Button>
        </div>

          {items.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Export requests</p>
            <div className="space-y-2">
              {items.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div className="flex items-center gap-3">
                    {exp.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : exp.status === 'processing' ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <FileArchive className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {new Date(exp.initiatedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {exp.completedAt
                          ? `Completed ${new Date(exp.completedAt).toLocaleString()}`
                          : 'In progress'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(statusColors[exp.status] ?? 'bg-secondary')}>
                      {exp.status}
                    </Badge>
                    {exp.status === 'completed' && exp.downloadUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={exp.downloadUrl} download>
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notification history export</CardTitle>
          </div>
          <CardDescription>
            Export notification history, preferences, and delivery status for audit or compliance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="notif-format">Format</Label>
              <Select value={notifFormat} onValueChange={(v) => setNotifFormat(v as 'json' | 'csv')}>
                <SelectTrigger id="notif-format" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-date-from">From date (optional)</Label>
              <Input
                id="notif-date-from"
                type="date"
                value={notifDateFrom}
                onChange={(e) => setNotifDateFrom(e.target.value)}
                className="rounded-lg bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-date-to">To date (optional)</Label>
              <Input
                id="notif-date-to"
                type="date"
                value={notifDateTo}
                onChange={(e) => setNotifDateTo(e.target.value)}
                className="rounded-lg bg-input"
              />
            </div>
          </div>
          <Button
            onClick={handleNotificationExport}
            disabled={notificationExportMutation.isPending}
            variant="secondary"
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            {notificationExportMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Bell className="mr-2 h-4 w-4" />
            )}
            Request notification export
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
