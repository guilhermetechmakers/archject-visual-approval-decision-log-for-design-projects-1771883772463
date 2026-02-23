import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CollapsibleSection } from './collapsible-section'
import type { VersionedDecision, DecisionObject } from '@/types/edit-decision'
import type { DecisionStatus } from '@/types/workspace'

const STATUS_VARIANT: Record<
  DecisionStatus,
  'default' | 'success' | 'warning' | 'destructive'
> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

export interface QuickPreviewPanelProps {
  decision: VersionedDecision
  projectId: string
  className?: string
}

export function QuickPreviewPanel({
  decision,
  projectId: _projectId,
  className,
}: QuickPreviewPanelProps) {
  return (
    <CollapsibleSection
      title="Quick Preview"
      defaultOpen={true}
      className={className}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-secondary/30 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-foreground">{decision.title}</h4>
            <Badge variant={STATUS_VARIANT[decision.status]}>
              {decision.status}
            </Badge>
          </div>
          {decision.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {decision.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <h5 className="text-sm font-medium text-foreground">Decision Objects</h5>
          {decision.decision_objects?.length ? (
            <ul className="space-y-2">
              {decision.decision_objects.map((obj) => (
                <ObjectPreview key={obj.id} object={obj} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No objects yet.</p>
          )}
        </div>

        <a
          href={`/portal/${decision.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Open in client portal
        </a>
      </div>
    </CollapsibleSection>
  )
}

function ObjectPreview({ object }: { object: DecisionObject }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">{object.title}</p>
          <Badge variant={STATUS_VARIANT[object.status]} className="text-xs">
            {object.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="py-0 pb-3">
        {object.options?.length ? (
          <ul className="space-y-1">
            {object.options.slice(0, 3).map((opt) => (
              <li
                key={opt.id}
                className="flex items-center justify-between gap-2 text-xs text-muted-foreground"
              >
                <span>{opt.label}</span>
                {opt.cost != null && (
                  <span className="font-medium">
                    {typeof opt.cost === 'string' && opt.cost.startsWith('$')
                      ? opt.cost
                      : `$${opt.cost}`}
                  </span>
                )}
              </li>
            ))}
            {object.options.length > 3 && (
              <li className="text-xs text-muted-foreground">
                +{object.options.length - 3} more
              </li>
            )}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No options</p>
        )}
      </CardContent>
    </Card>
  )
}
