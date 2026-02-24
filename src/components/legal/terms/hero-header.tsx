import type { LegalDocument } from '@/types/legal'
import { cn } from '@/lib/utils'

export interface HeroHeaderProps {
  title?: string
  effectiveDate?: string
  document?: LegalDocument
  className?: string
}

export function HeroHeader({
  title,
  effectiveDate,
  document: doc,
  className,
}: HeroHeaderProps) {
  const displayTitle = title ?? doc?.name ?? 'Terms of Service'
  const displayDate = effectiveDate ?? doc?.effectiveDate ?? ''
  return (
    <header
      className={cn(
        'space-y-4 border-b border-border pb-8',
        className
      )}
      aria-labelledby="terms-title"
    >
      <h1
        id="terms-title"
        className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
      >
        {displayTitle}
      </h1>
      <p className="text-sm text-muted-foreground">
        Effective date: {displayDate}
      </p>
    </header>
  )
}
