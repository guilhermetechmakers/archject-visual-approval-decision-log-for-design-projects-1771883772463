/**
 * SearchResultCard - consistent card layout for search results
 * Highlights matched terms, quick actions (open, share, export)
 */

import { Link } from 'react-router-dom'
import { FolderKanban, FileCheck, FileText, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SearchResultItem, SearchEntityType } from '@/types/search'

const ENTITY_ICONS: Record<SearchEntityType, React.ElementType> = {
  project: FolderKanban,
  decision: FileCheck,
  file: FileText,
  comment: MessageSquare,
}

const ENTITY_LABELS: Record<SearchEntityType, string> = {
  project: 'Project',
  decision: 'Decision',
  file: 'File',
  comment: 'Comment',
}

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'secondary'> = {
  approved: 'success',
  accepted: 'success',
  pending: 'warning',
  draft: 'secondary',
  active: 'default',
}

export interface SearchResultCardProps {
  item: SearchResultItem
  className?: string
}

export function SearchResultCard({ item, className }: SearchResultCardProps) {
  const Icon = ENTITY_ICONS[item.type]
  const statusVariant = STATUS_VARIANTS[item.status?.toLowerCase() ?? ''] ?? 'default'

  return (
    <Link to={item.href} className="block">
      <Card
        className={cn(
          'transition-all duration-200 hover:shadow-card-hover hover:border-primary/20',
          'focus-within:ring-2 focus-within:ring-primary/20 focus-within:ring-offset-2',
          className
        )}
      >
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium text-foreground truncate">{item.title}</p>
              <Badge variant={statusVariant} className="shrink-0 text-xs">
                {ENTITY_LABELS[item.type]}
              </Badge>
              {item.status && item.status !== 'active' && (
                <Badge variant="outline" className="shrink-0 text-xs">
                  {item.status}
                </Badge>
              )}
            </div>
            {item.excerpt && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
            )}
            {item.projectName && (
              <p className="mt-1 text-xs text-muted-foreground">
                {item.projectName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
