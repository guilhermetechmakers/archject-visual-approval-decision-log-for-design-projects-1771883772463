import {
  FileText,
  Image,
  File,
  MoreHorizontal,
  Download,
  Link2,
  Eye,
  Grid3X3,
  List,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { DecisionLinkIndicator } from './decision-link-indicator'
import type { LibraryFile } from '@/types/files-library'
import type { FileType } from '@/types/workspace'

const fileTypeIcons: Record<FileType, React.ComponentType<{ className?: string }>> = {
  drawing: FileText,
  spec: FileText,
  image: Image,
  BIM: File,
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export interface FileCardGridProps {
  files: LibraryFile[]
  viewMode?: 'grid' | 'list'
  onViewModeChange?: (mode: 'grid' | 'list') => void
  onPreview?: (file: LibraryFile) => void
  onDownload?: (file: LibraryFile) => void
  onLinkToDecision?: (file: LibraryFile) => void
  onNavigateToDecision?: (decisionId: string) => void
  isLoading?: boolean
  className?: string
}

export function FileCardGrid({
  files,
  viewMode = 'grid',
  onViewModeChange,
  onPreview,
  onDownload,
  onLinkToDecision,
  onNavigateToDecision,
  isLoading = false,
  className,
}: FileCardGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid gap-4',
          viewMode === 'grid'
            ? 'sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1',
          className
        )}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-32 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-medium">No files yet</p>
          <p className="text-sm text-muted-foreground">
            Upload drawings, specs, or BIM files to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {onViewModeChange && (
        <div className="flex justify-end gap-1">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onViewModeChange('grid')}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => onViewModeChange('list')}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          'grid gap-4',
          viewMode === 'grid'
            ? 'sm:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        )}
      >
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            viewMode={viewMode}
            onPreview={onPreview}
            onDownload={onDownload}
            onLinkToDecision={onLinkToDecision}
            onNavigateToDecision={onNavigateToDecision}
          />
        ))}
      </div>
    </div>
  )
}

function FileCard({
  file,
  viewMode,
  onPreview,
  onDownload,
  onLinkToDecision,
  onNavigateToDecision,
}: {
  file: LibraryFile
  viewMode: 'grid' | 'list'
  onPreview?: (file: LibraryFile) => void
  onDownload?: (file: LibraryFile) => void
  onLinkToDecision?: (file: LibraryFile) => void
  onNavigateToDecision?: (decisionId: string) => void
}) {
  const Icon = fileTypeIcons[file.type] ?? File

  const thumbnail = (
    <div
      className={cn(
        'flex items-center justify-center bg-secondary/50 shrink-0',
        viewMode === 'grid' ? 'h-24 w-full' : 'h-16 w-16 rounded-lg'
      )}
    >
      {file.previewUrl ? (
        <img
          src={file.previewUrl}
          alt=""
          className={cn(
            'object-cover',
            viewMode === 'grid' ? 'h-full w-full' : 'h-16 w-16 rounded-lg'
          )}
        />
      ) : (
        <Icon className="h-10 w-10 text-muted-foreground" />
      )}
    </div>
  )

  const meta = (
    <div className="min-w-0 flex-1 p-4">
      <p className="truncate text-sm font-medium">{file.name}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>v{file.version}</span>
        <span>•</span>
        <span>{formatSize(file.size)}</span>
        <span>•</span>
        <span>{formatDate(file.uploadedAt)}</span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <DecisionLinkIndicator
          count={file.linkedDecisionsCount}
          linkedDecisions={file.linkedDecisions}
          onNavigate={onNavigateToDecision}
        />
        {file.version > 1 && (
          <Badge variant="secondary" className="text-xs">
            Updated
          </Badge>
        )}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            onPreview?.(file)
          }}
          aria-label="Preview"
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            onDownload?.(file)
          }}
          asChild={!!file.cdnUrl}
          aria-label="Download"
        >
          {file.cdnUrl ? (
            <a href={file.cdnUrl} download target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
              <Download className="h-4 w-4" />
            </a>
          ) : (
            <Download className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            onLinkToDecision?.(file)
          }}
          aria-label="Link to decision"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={(e) => e.stopPropagation()}
              aria-label="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onPreview?.(file)}>
              Preview
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDownload?.(file)}>
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLinkToDecision?.(file)}>
              Link to decision
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )

  if (viewMode === 'list') {
    return (
      <Card
        className="overflow-hidden transition-all duration-200 hover:shadow-card-hover cursor-pointer"
        onClick={() => onPreview?.(file)}
      >
        <CardContent className="flex flex-row items-center gap-4 p-0">
          {thumbnail}
          {meta}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-200 hover:shadow-card-hover cursor-pointer"
      onClick={() => onPreview?.(file)}
    >
      <CardContent className="p-0">
        {thumbnail}
        {meta}
      </CardContent>
    </Card>
  )
}
