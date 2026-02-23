import { Download, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ExportStatus = 'idle' | 'pending' | 'processing' | 'ready' | 'error'

export interface DataExportRowProps {
  status: ExportStatus
  progress?: number
  downloadUrl?: string
  onStartExport: () => void
  onDownload?: () => void
  className?: string
}

export function DataExportRow({
  status,
  progress = 0,
  downloadUrl,
  onStartExport,
  onDownload,
  className,
}: DataExportRowProps) {
  const isProcessing = status === 'pending' || status === 'processing'
  const isReady = status === 'ready'

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Workspace data export</CardTitle>
        <p className="text-sm text-muted-foreground">
          Export billing, branding, and workspace data. Downloads as a ZIP file.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {isProcessing && (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            <Badge
              variant={
                status === 'error'
                  ? 'destructive'
                  : isReady
                    ? 'success'
                    : 'secondary'
              }
            >
              {status === 'idle' && 'Ready'}
              {status === 'pending' && 'Preparing...'}
              {status === 'processing' && 'Processing...'}
              {status === 'ready' && 'Ready to download'}
              {status === 'error' && 'Error'}
            </Badge>
          </div>
          <div className="flex gap-2">
            {!isProcessing && !isReady && (
              <Button onClick={onStartExport} disabled={isProcessing}>
                <Download className="mr-2 h-4 w-4" />
                Start export
              </Button>
            )}
            {isReady && (downloadUrl || onDownload) && (
              <Button onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
          </div>
        </div>
        {isProcessing && <Progress value={progress} className="h-2" />}
      </CardContent>
    </Card>
  )
}
