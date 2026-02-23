import { Star, Paperclip, Eye, GitCompare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DecisionOption } from '@/types/decision-detail'

function getMediaUrl(opt: DecisionOption): string | null {
  const firstId = opt.mediaPreviewIds[0]
  if (!firstId) return null
  const att = opt.attachments.find((a) => a.id === firstId)
  return att?.url ?? null
}

export interface OptionCardProps {
  option: DecisionOption
  isRecommended?: boolean
  onToggleRecommended?: () => void
  onViewAttachments?: () => void
  onCompare?: () => void
  className?: string
}

export function OptionCard({
  option,
  isRecommended = option.isRecommended,
  onToggleRecommended,
  onViewAttachments,
  onCompare,
  className,
}: OptionCardProps) {
  const thumbUrl = getMediaUrl(option)
  const hasAttachments = option.attachments.length > 0

  return (
    <Card
      className={cn(
        'overflow-hidden rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        isRecommended && 'ring-2 ring-primary/30',
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row">
          <div className="flex h-32 w-full shrink-0 items-center justify-center bg-secondary/50 sm:h-36 sm:w-40">
            {thumbUrl ? (
              <img
                src={thumbUrl}
                alt={option.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <Paperclip className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground">{option.title}</h3>
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn(
                  'shrink-0 transition-colors',
                  isRecommended && 'text-primary'
                )}
                onClick={onToggleRecommended}
                aria-label={isRecommended ? 'Unmark recommended' : 'Mark recommended'}
              >
                <Star
                  className={cn('h-4 w-4', isRecommended && 'fill-current')}
                />
              </Button>
            </div>
            {option.description && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {option.description}
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              {option.cost && (
                <Badge variant="secondary" className="text-xs">
                  {option.cost}
                </Badge>
              )}
              {option.leadTime != null && (
                <Badge variant="outline" className="text-xs">
                  {option.leadTime} days
                </Badge>
              )}
              {isRecommended && (
                <Badge className="bg-primary/20 text-primary">Recommended</Badge>
              )}
            </div>
            {option.dependencies.length > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">
                Dependencies: {option.dependencies.join(', ')}
              </p>
            )}
            <div className="mt-3 flex gap-2">
              {hasAttachments && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onViewAttachments}
                  className="h-8 text-xs"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View attachments
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onCompare}
                className="h-8 text-xs"
              >
                <GitCompare className="mr-1 h-3 w-3" />
                Compare
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
