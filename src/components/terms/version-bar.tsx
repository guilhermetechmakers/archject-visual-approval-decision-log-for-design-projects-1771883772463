import type { LegalDocument } from '@/types/legal'
import { cn } from '@/lib/utils'

export interface VersionBarProps {
  document: LegalDocument
  className?: string
}

export function VersionBar({ document, className }: VersionBarProps) {
  return (
    <footer
      className={cn(
        'border-t border-border pt-8',
        className
      )}
      role="contentinfo"
    >
      <p className="text-sm text-muted-foreground">
        Version {document.version} • Effective {document.effectiveDate} • Last
        updated {document.lastUpdated}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        For legal inquiries, contact{' '}
        <a
          href="mailto:legal@archject.com"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          legal@archject.com
        </a>
      </p>
    </footer>
  )
}
