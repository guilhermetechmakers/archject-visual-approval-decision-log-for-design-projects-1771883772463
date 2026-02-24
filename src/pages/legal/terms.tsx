import { useCallback, useState } from 'react'
import { HeaderNav } from '@/components/layout/header-nav'
import {
  HeroHeader,
  TableOfContents,
  SectionRenderer,
  AcceptConsentNote,
  ExportPanel,
  VersionBar,
} from '@/components/legal/terms'
import { useTermsOfService } from '@/hooks/use-terms-of-service'
import {
  exportTermsOfServiceToPdf,
  downloadPdfBlob,
} from '@/lib/pdf-export-service'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export function TermsPage() {
  const { data: document, isLoading, error } = useTermsOfService()
  const [isExporting, setIsExporting] = useState(false)

  const handleExportPdf = useCallback(async () => {
    if (!document) return
    setIsExporting(true)
    try {
      const blob = await exportTermsOfServiceToPdf(document, {
        includeCoverPage: false,
      })
      downloadPdfBlob(
        blob,
        `archject-terms-of-service-${document.lastUpdated}.pdf`
      )
      toast.success('Terms of Service downloaded successfully')
    } catch {
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [document])

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNav />
        <main className="container mx-auto max-w-3xl px-4 py-16">
          <p className="text-destructive">Failed to load Terms of Service.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground print:hidden"
      >
        Skip to content
      </a>
      <HeaderNav />
      <main
        id="main-content"
        className="container mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-16"
        role="main"
      >
        {isLoading ? (
          <TermsPageSkeleton />
        ) : document ? (
          <div className="space-y-8 animate-fade-in">
            <HeroHeader document={document} />

            <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
              <aside
                className="lg:sticky lg:top-24 lg:self-start print:hidden"
                aria-label="Table of contents"
              >
                <TableOfContents sections={document.sections} />
                <div className="mt-6 hidden lg:block">
                  <ExportPanel
                    onExportPdf={handleExportPdf}
                    isExporting={isExporting}
                  />
                </div>
              </aside>

              <div className="min-w-0 space-y-12">
                <div className="lg:hidden print:hidden">
                  <ExportPanel
                    onExportPdf={handleExportPdf}
                    isExporting={isExporting}
                  />
                </div>

                <div className="space-y-12">
                  {document.sections.map((section, index) => (
                    <SectionRenderer
                      key={section.id}
                      section={section}
                      className="animate-fade-in-up"
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationFillMode: 'both',
                      }}
                    />
                  ))}
                </div>

                <AcceptConsentNote className="print:hidden" />

                <VersionBar document={document} />
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}

function TermsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
          <Skeleton className="h-4 w-24" />
          <div className="flex flex-col gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-8">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
