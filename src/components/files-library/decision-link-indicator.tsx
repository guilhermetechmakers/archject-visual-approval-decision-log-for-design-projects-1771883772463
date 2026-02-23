import { Link2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DecisionAttachment } from '@/types/files-library'

export interface DecisionLinkIndicatorProps {
  count: number
  linkedDecisions?: DecisionAttachment[]
  onNavigate?: (decisionId: string) => void
  className?: string
}

export function DecisionLinkIndicator({
  count,
  linkedDecisions = [],
  onNavigate,
  className,
}: DecisionLinkIndicatorProps) {
  if (count === 0) return null

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Link2 className="h-4 w-4 text-primary" aria-hidden />
      <Badge
        variant="success"
        className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-sm"
        onClick={() => {
          const first = linkedDecisions[0]
          if (first && onNavigate) onNavigate(first.decisionId)
        }}
        role={onNavigate ? 'button' : undefined}
        aria-label={`${count} linked decision${count !== 1 ? 's' : ''}`}
      >
        {count} linked
      </Badge>
    </div>
  )
}
