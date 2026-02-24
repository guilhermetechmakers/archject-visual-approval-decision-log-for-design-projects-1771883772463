/**
 * Search results grid - card/table layout with highlights, quick actions
 */

import { Link } from 'react-router-dom'
import {
  FolderKanban,
  FileText,
  File,
  MessageSquare,
  ExternalLink,
  Share2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { SearchResultItem, SearchEntityType } from '@/types/search'

const entityIcons: Record<SearchEntityType, React.ElementType> = {
  project: FolderKanban,
  decision: FileText,
  file: File,
  comment: MessageSquare,
}

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  approved: 'success',
  accepted: 'success',
  pending: 'warning',
  draft: 'secondary',
  rejected: 'destructive',
  active: 'default',
}

export interface SearchResultsGridProps {
  results: SearchResultItem[]
  isLoading?: boolean
  onShare?: (item: SearchResultItem) => void
  onPreview?: (item: SearchResultItem) => void
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  showBulkActions?: boolean
  className?: string
}

export function SearchResultsGrid({
  results,
  isLoading,
  onShare,
  onPreview: _onPreview,
  selectedIds,
  onSelectionChange,
  showBulkActions = false,
  className,
}: SearchResultsGridProps) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 py-16',
          className
        )}
      >
        <FileText className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 font-medium text-foreground">No results found</p>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)} role="list">
      {results.map((item) => (
        <SearchResultCard
          key={`${item.type}-${item.id}`}
          item={item}
          onShare={onShare}
          selected={selectedIds?.has(item.id)}
          onSelect={
            onSelectionChange && showBulkActions
              ? () => {
                  const next = new Set(selectedIds ?? [])
                  if (next.has(item.id)) next.delete(item.id)
                  else next.add(item.id)
                  onSelectionChange(next)
                }
              : undefined
          }
          showCheckbox={showBulkActions}
        />
      ))}
    </div>
  )
}

function SearchResultCard({
  item,
  onShare,
  selected,
  onSelect,
  showCheckbox,
}: {
  item: SearchResultItem
  onShare?: (item: SearchResultItem) => void
  selected?: boolean
  onSelect?: () => void
  showCheckbox?: boolean
}) {
  const Icon = entityIcons[item.type]
  const badgeVariant = statusVariants[item.status] ?? 'default'

  return (
    <Card
      className={cn(
        'transition-all duration-200 hover:shadow-card-hover',
        selected && 'ring-2 ring-primary'
      )}
    >
      <CardContent className="flex items-center gap-4 py-4">
        {showCheckbox && onSelect && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="h-4 w-4 rounded border-border"
            aria-label={`Select ${item.title}`}
          />
        )}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        </div>
        <div className="min-w-0 flex-1">
          <Link
            to={item.href}
            className="block font-medium text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          >
            {item.title}
          </Link>
          {item.excerpt && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {item.excerpt}
            </p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {item.projectName && (
              <span className="text-xs text-muted-foreground">
                {item.projectName}
              </span>
            )}
            <Badge variant={badgeVariant} className="text-xs">
              {item.status}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label={`Open ${item.title}`}
          >
            <Link to={item.href}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          {onShare && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onShare(item)}
              aria-label={`Share ${item.title}`}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
