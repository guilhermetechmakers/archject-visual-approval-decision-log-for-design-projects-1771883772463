import type { LegalDocument } from '@/types/legal'

export interface HeroHeaderProps {
  document: LegalDocument
}

export function HeroHeader({ document }: HeroHeaderProps) {
  return (
    <header className="space-y-4">
      <h1 className="text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
        {document.name}
      </h1>
      <p className="text-sm text-muted-foreground md:text-base">
        Effective date: {document.effectiveDate} • Last updated:{' '}
        {document.lastUpdated}
      </p>
    </header>
  )
}
