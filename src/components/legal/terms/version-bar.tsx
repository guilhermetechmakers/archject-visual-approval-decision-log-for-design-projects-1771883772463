import type { LegalDocument } from '@/types/legal'
import { cn } from '@/lib/utils'

export interface VersionBarProps {
  lastUpdated?: string
  version?: number
  legalContact?: string
  document?: LegalDocument
  className?: string
}

export function VersionBar({
  lastUpdated,
  version,
  legalContact = 'legal@archject.com',
  document: doc,
  className,
}: VersionBarProps) {
  const displayLastUpdated = lastUpdated ?? doc?.lastUpdated ?? ''
  const displayVersion = version ?? doc?.version ?? 1
  return (
    <footer
      className={cn(
        'border-t border-border pt-8',
        className
      )}
      role="contentinfo"
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <span>Version {displayVersion}</span>
        <span>Last updated: {displayLastUpdated}</span>
        <a
          href={`mailto:${legalContact}`}
          className="text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          Contact legal
        </a>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <a
          href="/privacy"
          className="text-sm text-primary hover:underline"
        >
          Privacy Policy
        </a>
        <a
          href="/cookies"
          className="text-sm text-primary hover:underline"
        >
          Cookie Policy
        </a>
      </div>
    </footer>
  )
}
