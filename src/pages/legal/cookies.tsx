import { useCallback, useEffect, useState } from 'react'
import {
  Cookie,
  LayoutGrid,
  PieChart,
  History,
  Mail,
  FileText,
  Shield,
} from 'lucide-react'
import { HeaderNav } from '@/components/layout/header-nav'
import {
  CategoryCard,
  ChangeHistoryTable,
  SaveBar,
  SummaryPanel,
} from '@/components/cookie-policy'
import {
  loadConsent,
  loadHistory,
  saveConsent,
} from '@/lib/cookie-consent-storage'
import {
  diffConsentToHistory,
  createAcceptAllEntries,
  createResetEntries,
} from '@/lib/cookie-consent-audit'
import type { ConsentState } from '@/types/cookie-consent'
import { DEFAULT_CONSENT } from '@/types/cookie-consent'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

const CATEGORY_CONFIG = [
  {
    id: 'necessary',
    title: 'Necessary',
    description:
      'Essential cookies required for the site to function. These include authentication, session management, and security. They cannot be disabled.',
    locked: true,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    description:
      'Cookies that help us understand how visitors interact with our site. We use this data to improve our service and user experience.',
    locked: false,
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description:
      'Cookies used to deliver relevant advertisements and track campaign effectiveness. These may be set by our advertising partners.',
    locked: false,
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description:
      'Cookies that remember your settings and preferences, such as language and theme, to provide a personalized experience.',
    locked: false,
  },
] as const

export function CookiesPage() {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT)
  const [lastSavedConsent, setLastSavedConsent] =
    useState<ConsentState>(DEFAULT_CONSENT)
  const [history, setHistory] = useState<ReturnType<typeof loadHistory>>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const loaded = loadConsent()
    setConsent(loaded)
    setLastSavedConsent(loaded)
    setHistory(loadHistory())
    setIsInitialLoad(false)
  }, [])

  const hasChanges =
    consent.analytics !== lastSavedConsent.analytics ||
    consent.marketing !== lastSavedConsent.marketing ||
    consent.preferences !== lastSavedConsent.preferences

  const updateCategory = useCallback(
    (key: 'analytics' | 'marketing' | 'preferences', value: boolean) => {
      setConsent((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

  const handleSave = useCallback(() => {
    if (!hasChanges) return
    setIsSaving(true)
    setSaveError(null)
    try {
      const entries = diffConsentToHistory(lastSavedConsent, consent)
      saveConsent(consent, entries)
      setLastSavedConsent(consent)
      setHistory(loadHistory())
      toast.success('Preferences saved successfully')
    } catch {
      const message = 'Failed to save preferences. Please try again.'
      setSaveError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }, [consent, lastSavedConsent, hasChanges])

  const handleAcceptAll = useCallback(() => {
    const allOn: ConsentState = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    setConsent(allOn)
    setLastSavedConsent(allOn)
    setIsSaving(true)
    setSaveError(null)
    try {
      const entries = createAcceptAllEntries()
      saveConsent(allOn, entries)
      setHistory(loadHistory())
      toast.success('All cookies accepted')
    } catch {
      const message = 'Failed to save. Please try again.'
      setSaveError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }, [])

  const handleReset = useCallback(() => {
    const defaults = { ...DEFAULT_CONSENT }
    setConsent(defaults)
    setLastSavedConsent(defaults)
    setIsSaving(true)
    setSaveError(null)
    try {
      const entries = createResetEntries(lastSavedConsent)
      saveConsent(defaults, entries)
      setHistory(loadHistory())
      toast.success('Preferences reset to defaults')
    } catch {
      const message = 'Failed to reset. Please try again.'
      setSaveError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }, [lastSavedConsent])

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
      >
        <div className="space-y-8 animate-fade-in">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <Cookie
                className="h-10 w-10 text-primary md:h-12 md:w-12"
                aria-hidden
              />
              <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Cookie Policy
              </h1>
            </div>
            <p className="max-w-2xl text-muted-foreground">
              Explain cookies used on this site and manage consent for marketing
              cookies. Toggle each category below and save your preferences.
            </p>
            <p className="text-sm text-muted-foreground" role="status">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <nav
              aria-label="Quick navigation to page sections"
              className="flex flex-wrap gap-2 pt-2"
            >
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-pill text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <a
                  href="#categories"
                  aria-label="Jump to cookie categories section"
                >
                  <LayoutGrid className="mr-2 h-4 w-4" aria-hidden />
                  Categories
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-pill text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <a href="#summary" aria-label="Jump to consent summary section">
                  <PieChart className="mr-2 h-4 w-4" aria-hidden />
                  Summary
                </a>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="rounded-pill text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <a
                  href="#history"
                  aria-label="Jump to change history section"
                >
                  <History className="mr-2 h-4 w-4" aria-hidden />
                  Change History
                </a>
              </Button>
            </nav>
          </header>

          {saveError && (
            <Alert variant="destructive" role="alert" aria-live="assertive">
              <AlertDescription>{saveError}</AlertDescription>
            </Alert>
          )}

          {isInitialLoad ? (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton
                    key={i}
                    className="h-[140px] rounded-xl"
                    aria-hidden
                  />
                ))}
              </div>
              <Skeleton className="h-20 rounded-xl" aria-hidden />
              <Skeleton className="h-64 rounded-xl" aria-hidden />
            </div>
          ) : (

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <section
                id="categories"
                aria-labelledby="categories-heading"
                className="space-y-4"
              >
                <h2
                  id="categories-heading"
                  className="text-xl font-semibold text-foreground"
                >
                  Cookie Categories
                </h2>
                <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {CATEGORY_CONFIG.map((config, i) => (
                  <CategoryCard
                    key={config.id}
                    id={`cookie-${config.id}`}
                    title={config.title}
                    description={config.description}
                    checked={consent[config.id as keyof ConsentState]}
                    onCheckedChange={
                      config.locked
                        ? undefined
                        : (v) =>
                            updateCategory(
                              config.id as 'analytics' | 'marketing' | 'preferences',
                              v
                            )
                    }
                    locked={config.locked}
                    className="animate-fade-in-up"
                    style={{
                      animationDelay: `${i * 50}ms`,
                      animationFillMode: 'both',
                    }}
                  />
                ))}
                </div>
              </section>

              <SaveBar
                onSave={handleSave}
                onAcceptAll={handleAcceptAll}
                onReset={handleReset}
                isSaving={isSaving}
                hasChanges={hasChanges}
              />

              <section
                id="history"
                aria-labelledby="history-heading"
              >
                <ChangeHistoryTable entries={history} />
              </section>
            </div>

            <aside
              id="summary"
              aria-labelledby="summary-heading"
              className="lg:sticky lg:top-24 lg:self-start"
            >
              <SummaryPanel consent={consent} />
            </aside>
          </div>
          )}

          <footer className="border-t border-border pt-8">
            <p className="text-sm text-muted-foreground">
              For questions about cookies, contact{' '}
              <a
                href="mailto:privacy@archject.com"
                className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
                aria-label="Email privacy team at privacy@archject.com"
              >
                <Mail className="h-4 w-4" aria-hidden />
                privacy@archject.com
              </a>
            </p>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href="/terms"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                aria-label="View Terms of Service"
              >
                <FileText className="h-4 w-4" aria-hidden />
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                aria-label="View Privacy Policy"
              >
                <Shield className="h-4 w-4" aria-hidden />
                Privacy Policy
              </a>
            </div>
          </footer>
        </div>
      </main>
    </div>
  )
}
