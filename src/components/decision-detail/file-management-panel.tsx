import { FileText, Image, File, Download, Eye, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { DecisionFile } from '@/types/decision-detail'

const fileTypeIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  drawing: FileText,
  spec: FileText,
  image: Image,
  pdf: FileText,
  default: File,
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export interface FileManagementPanelProps {
  files: DecisionFile[]
  projectId?: string
  onPreview?: (file: DecisionFile) => void
  onLinkToDecision?: (file: DecisionFile) => void
  className?: string
}

export function FileManagementPanel({
  files,
  projectId: _projectId,
  onPreview,
  onLinkToDecision,
  className,
}: FileManagementPanelProps) {
  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <h3 className="text-lg font-semibold">Files & Drawings</h3>
        <p className="text-sm text-muted-foreground">
          Related files with version history
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px]">
          {files.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No files linked to this decision
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload from Create/Edit Decision or link from Files Library
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => {
                const Icon =
                  fileTypeIcons[file.fileType] ?? fileTypeIcons.default
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 p-3 transition-colors hover:bg-secondary/40"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {file.fileName}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>v{file.version}</span>
                        <span>•</span>
                        <span>{formatDate(file.uploadedAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onPreview?.(file)}
                        aria-label="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onLinkToDecision?.(file)}
                        aria-label="Link to decision"
                      >
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        asChild
                        aria-label="Download"
                      >
                        <a href={file.url} download target="_blank" rel="noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
