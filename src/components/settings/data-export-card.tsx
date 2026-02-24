import { Download, FileArchive, Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSettingsDataExports, useCreateDataExport } from '@/hooks/use-settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function DataExportCard() {
  const { data: exports, isLoading } = useSettingsDataExports()
  const createMutation = useCreateDataExport()

  const handleRequestExport = async () => {
    try {
      await createMutation.mutateAsync()
      toast.success('Export requested. You will be notified when it is ready.')
    } catch {
      toast.error('Failed to request export')
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
  )
}
