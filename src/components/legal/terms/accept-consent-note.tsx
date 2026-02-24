import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AcceptConsentNoteProps {
  className?: string
}

export function AcceptConsentNote({ className }: AcceptConsentNoteProps) {
  return (
    <aside
      role="note"
      aria-label="Consent information"
      className={cn(
        'flex gap-3 rounded-lg border border-border bg-muted/30 p-4',
        className
      )}
    >
      <Info
        className="h-5 w-5 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">
        Acceptance of these terms is captured during signup. By creating an
        account, you confirm that you have read, understood, and agree to be
        bound by these Terms of Service.
      </p>
    </aside>
  )
}
