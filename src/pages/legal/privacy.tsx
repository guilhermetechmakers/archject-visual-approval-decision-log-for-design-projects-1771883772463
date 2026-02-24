import { useState, useCallback } from 'react'
import { HeaderNav } from '@/components/layout/header-nav'
import { Button } from '@/components/ui/button'
import {
  SectionCard,
  RegionNotice,
  PolicyLinkList,
  TextBlock,
} from '@/components/legal'
import { usePrivacyPolicy, useRegions } from '@/hooks/use-privacy-policy'
import {
  exportPrivacyPolicyToPdf,
  downloadPdfBlob,
} from '@/lib/pdf-export-service'
import { Skeleton } from '@/components/ui/skeleton'
import { FileDown, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function PrivacyPage() {
  const { data: policy, isLoading, error } = usePrivacyPolicy()
  const { data: regionsData } = useRegions()
  const [selectedRegion, setSelectedRegion] = useState<string>('EU')
  const [isExporting, setIsExporting] = useState(false)

  const handleDownloadPdf = useCallback(async () => {
    if (!policy) return
    setIsExporting(true)
    try {
      const blob = await exportPrivacyPolicyToPdf(policy, {
        region: selectedRegion,
        includeNotices: true,
        includeCoverPage: false,
      })
      downloadPdfBlob(blob, `archject-privacy-policy-${policy.lastUpdated}.pdf`)
      toast.success('Privacy Policy downloaded successfully')
    } catch {
      toast.error('Failed to export PDF. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }, [policy, selectedRegion])

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <HeaderNav />
        <main className="container mx-auto max-w-3xl px-4 py-16">
          <p className="text-destructive">Failed to load privacy policy.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <HeaderNav />
      <main
        id="main-content"
        className="container mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-16"
        role="main"
      >
        {isLoading ? (
          <PrivacyPolicySkeleton />
        ) : policy ? (
          <div className="space-y-8 animate-fade-in">
            <header className="space-y-4">
              <h1 className="text-3xl font-bold text-foreground md:text-4xl">
                {policy.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <p className="text-sm text-muted-foreground">
                  Version {policy.version} • Last updated: {policy.lastUpdated}
                </p>
                <Button
                  onClick={handleDownloadPdf}
                  disabled={isExporting}
                  className="rounded-pill"
                  aria-label="Download Privacy Policy as PDF"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <FileDown className="h-4 w-4" aria-hidden />
                  )}
                  {isExporting ? 'Exporting...' : 'Download PDF'}
                </Button>
              </div>
            </header>

            <nav
              aria-label="Quick navigation"
              className="rounded-xl border border-border bg-muted/30 p-4"
            >
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                On this page
              </h2>
              <PolicyLinkList
                items={policy.sections
                  .sort((a, b) => a.order - b.order)
                  .map((s) => ({ id: s.id, title: s.title }))}
              />
            </nav>

            <div className="space-y-6">
              {policy.sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <SectionCard
                    key={section.id}
                    id={section.id}
                    title={section.title}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    <TextBlock content={section.content} />
                  </SectionCard>
                ))}
            </div>

            {policy.regionNotices.length > 0 && (
              <section
                aria-labelledby="region-notices-heading"
                className="space-y-4"
              >
                <h2
                  id="region-notices-heading"
                  className="text-xl font-semibold text-foreground"
                >
                  Region notices
                </h2>
                <div className="flex flex-wrap gap-2">
                  {regionsData?.regions.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRegion(r)}
                      className={cn(
                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        selectedRegion === r
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      )}
                      aria-pressed={selectedRegion === r}
                      aria-label={`Show ${r} region notice`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {policy.regionNotices
                  .filter((n) => n.region === selectedRegion)
                  .map((notice) => (
                    <RegionNotice
                      key={notice.region}
                      region={notice.region}
                      content={notice.content}
                      defaultOpen
                    />
                  ))}
              </section>
            )}

            <footer className="border-t border-border pt-8">
              <p className="text-sm text-muted-foreground">
                For questions about this policy, contact{' '}
                <a
                  href="mailto:privacy@archject.com"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  privacy@archject.com
                </a>
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <a
                  href="/terms"
                  className="text-sm text-primary hover:underline"
                >
                  Terms of Service
                </a>
                <a
                  href="/cookies"
                  className="text-sm text-primary hover:underline"
                >
                  Cookie Policy
                </a>
              </div>
            </footer>
          </div>
        ) : null}
      </main>
    </div>
  )
}

function PrivacyPolicySkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
