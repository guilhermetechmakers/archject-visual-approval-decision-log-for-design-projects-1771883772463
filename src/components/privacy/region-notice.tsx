import * as React from 'react'
import { ChevronDown, ChevronUp, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RegionNoticeProps {
  region: string
  content: string
  defaultOpen?: boolean
  className?: string
}

const regionStyles: Record<string, string> = {
  EU: 'bg-success/10 border-success/30 text-foreground',
  US: 'bg-muted/50 border-border text-foreground',
  APAC: 'bg-warning-muted/30 border-warning-muted text-foreground',
  OTHER: 'bg-muted/50 border-border text-foreground',
}

export function RegionNotice({
  region,
  content,
  defaultOpen = false,
  className,
}: RegionNoticeProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const style = regionStyles[region] ?? regionStyles.OTHER

  return (
    <div
      className={cn(
        'rounded-xl border p-4 transition-all duration-200',
        style,
        className
      )}
      role="region"
      aria-labelledby={`region-${region}-heading`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg p-1 -m-1"
        aria-expanded={isOpen}
        aria-controls={`region-${region}-content`}
        id={`region-${region}-heading`}
      >
        <span className="flex items-center gap-2 font-medium">
          <Shield className="h-4 w-4 shrink-0" aria-hidden />
          {region} Data Notice
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
        )}
      </button>
      <div
        id={`region-${region}-content`}
        className={cn(
          'mt-3 overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
        role="region"
      >
        <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
      </div>
    </div>
  )
}
