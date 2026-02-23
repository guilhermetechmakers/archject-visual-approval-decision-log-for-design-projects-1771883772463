import { useCallback, useState } from 'react'
import {
  Upload,
  FileText,
  Image,
  File,
  MoreHorizontal,
  Download,
  Link2,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ProjectFile } from '@/types/workspace'

export interface FilesLibraryProps {
  files: ProjectFile[]
  projectId?: string
  onUpload?: (files: File[]) => void
  storageUsedPercent?: number
  className?: string
}

const fileTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  drawing: FileText,
  spec: FileText,
  image: Image,
  BIM: File,
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function FilesLibrary({
  files,
  projectId: _projectId,
  onUpload,
  storageUsedPercent = 0,
  className,
}: FilesLibraryProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (onUpload) setIsDragging(true)
    },
    [onUpload]
  )

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (onUpload && e.dataTransfer.files.length) {
        onUpload(Array.from(e.dataTransfer.files))
      }
    },
    [onUpload]
  )

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Files & Drawings</h2>
      </div>

      {onUpload && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          )}
        >
          <Upload className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium">Drag and drop files here</p>
          <p className="text-sm text-muted-foreground">
            or click to browse. Supports PDF, images, BIM files.
          </p>
          {storageUsedPercent >= 80 && (
            <p className="mt-2 text-sm text-warning-muted">
              Storage at {storageUsedPercent}% — uploads may be limited.
            </p>
          )}
        </div>
      )}

      {files.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No files yet</p>
            <p className="text-sm text-muted-foreground">
              Upload drawings, specs, or BIM files to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {files.map((file) => {
            const Icon = fileTypeIcons[file.file_type] ?? File
            return (
              <Card
                key={file.id}
                className="overflow-hidden transition-all duration-200 hover:shadow-card-hover"
              >
                <CardContent className="p-0">
                  <div className="flex h-24 items-center justify-center bg-secondary/50">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="p-4">
                    <p className="truncate font-medium text-sm">{file.file_name}</p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>v{file.version}</span>
                      <span>{formatDate(file.uploaded_at)}</span>
                    </div>
                    {file.is_preview_generated && (
                      <span className="mt-2 inline-block rounded bg-success/20 px-2 py-0.5 text-xs text-primary">
                        CDN preview
                      </span>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="ghost" size="icon-sm" aria-label="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" aria-label="Link to decision">
                        <Link2 className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label="More actions"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem>Link to decision</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
