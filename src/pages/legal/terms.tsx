import { useCallback, useState } from 'react'
import { AlertCircle, FileText } from 'lucide-react'
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
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function TermsPage() {
  const { data: document, isLoading, error, refetch } = useTermsOfService()
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
        <main
          className="container mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-16"
          role="main"
          aria-label="Terms of Service"
        >
          <Card
            className="border-destructive/30 bg-destructive/5"
            role="alert"
            aria-live="assertive"
          >
            <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start">
              <AlertCircle
                className="h-10 w-10 shrink-0 text-destructive"
                aria-hidden
              />
              <div className="min-w-0 flex-1 space-y-2">
                <h2 className="text-lg font-semibold text-foreground">
                  Failed to load Terms of Service
                </h2>
                <p className="text-sm text-muted-foreground">
                  We could not load the document. Please check your connection
                  and try again.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  aria-label="Retry loading Terms of Service"
                  className="mt-2 w-fit"
                >
                  Try again
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground print:hidden"
        aria-label="Skip to main content"
      >
        Skip to content
      </a>
      <HeaderNav />
      <main
        id="main-content"
        className="container mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-16"
        role="main"
        aria-label="Terms of Service"
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
        ) : (
          <TermsPageEmptyState />
        )}
      </main>
    </div>
  )
}

function TermsPageSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in" aria-busy="true" aria-label="Loading Terms of Service">
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

function TermsPageEmptyState() {
  return (
    <Card
      className="flex flex-col items-center justify-center gap-4 py-12 text-center"
      role="status"
      aria-label="No content available"
    >
      <FileText
        className="h-12 w-12 text-muted-foreground"
        aria-hidden
      />
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">
          No content available
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          The Terms of Service document could not be found. Please try again
          later or contact support.
        </p>
      </div>
    </Card>
  )
}
