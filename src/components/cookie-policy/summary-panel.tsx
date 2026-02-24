import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ConsentState } from '@/types/cookie-consent'
import { Cookie } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SummaryPanelProps {
  consent: ConsentState
  className?: string
}

const CATEGORIES: { key: keyof ConsentState; label: string }[] = [
  { key: 'necessary', label: 'Necessary' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'preferences', label: 'Preferences' },
]

/**
 * At-a-glance overview of current consent state per category.
 */
export function SummaryPanel({ consent, className }: SummaryPanelProps) {
  const enabledCount = CATEGORIES.filter((c) => consent[c.key]).length
  const marketingEnabled = consent.marketing

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Cookie className="h-5 w-5 text-muted-foreground" aria-hidden />
          <h2 className="text-lg font-semibold">Consent Overview</h2>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="rounded-lg bg-muted/50 px-4 py-3 text-sm"
          role="status"
          aria-live="polite"
          aria-label={`${enabledCount} of 4 cookie categories enabled. Marketing cookies ${marketingEnabled ? 'enabled' : 'disabled'}.`}
        >
          <span className="font-medium text-foreground">
            {marketingEnabled ? 'Marketing cookies enabled' : 'Marketing cookies disabled'}
          </span>
          <span className="text-muted-foreground">
            {' '}
            · {enabledCount} of 4 categories active
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <Badge
              key={key}
              variant={consent[key] ? 'success' : 'secondary'}
              className={cn(
                'transition-colors',
                consent[key] && 'bg-success/20 text-primary'
              )}
            >
              {label}: {consent[key] ? 'On' : 'Off'}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
