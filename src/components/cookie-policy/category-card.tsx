import type { CSSProperties } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ConsentToggle } from './consent-toggle'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CategoryCardProps {
  id: string
  title: string
  description: string
  checked: boolean
  onCheckedChange?: (checked: boolean) => void
  locked?: boolean
  className?: string
  style?: CSSProperties
}

/**
 * Card for each cookie category with name, description, and toggle.
 * Necessary category is locked (always on, no toggle).
 */
export function CategoryCard({
  id,
  title,
  description,
  checked,
  onCheckedChange,
  locked = false,
  className,
  style,
}: CategoryCardProps) {
  return (
    <Card
      className={cn(
        'min-h-[140px] transition-all duration-200',
        className
      )}
      style={style}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {locked && (
            <span
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              aria-label="Always active, cannot be changed"
            >
              <Lock className="h-3.5 w-3.5" aria-hidden />
              Always on
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        <ConsentToggle
          id={id}
          checked={checked}
          onCheckedChange={onCheckedChange ?? (() => {})}
          disabled={locked}
          label={locked ? 'Required' : checked ? 'Enabled' : 'Disabled'}
          ariaLabel={
            locked
              ? `${title} cookies are always active`
              : `Toggle ${title} cookies`
          }
        />
      </CardContent>
    </Card>
  )
}
