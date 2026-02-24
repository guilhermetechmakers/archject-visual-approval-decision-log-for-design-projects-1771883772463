import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HelpCircle } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  HelpNavTabs,
  GettingStartedSection,
  KnowledgeBaseSection,
  FAQSection,
  OnboardingGuidesSection,
  ChangelogSection,
  ContactSupportSection,
} from '@/components/help'
import type { HelpTab } from '@/types/help'

const SECTIONS: { id: HelpTab; Component: React.ComponentType }[] = [
  { id: 'getting-started', Component: GettingStartedSection },
  { id: 'knowledge-base', Component: KnowledgeBaseSection },
  { id: 'faq', Component: FAQSection },
  { id: 'onboarding-guides', Component: OnboardingGuidesSection },
  { id: 'changelog', Component: ChangelogSection },
  { id: 'contact-support', Component: ContactSupportSection },
]

export function HelpPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const hash = location.hash.slice(1) as HelpTab | ''
  const activeTab =
    hash && SECTIONS.some((s) => s.id === hash) ? hash : 'getting-started'

  useEffect(() => {
    const el = document.getElementById(`panel-${activeTab}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeTab])

  const ActiveSection = SECTIONS.find((s) => s.id === activeTab)?.Component

  return (
    <div className="animate-fade-in">
      <Card className="overflow-hidden border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader className="space-y-4 px-4 pt-6 sm:px-6 sm:pt-8 md:px-8">
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
              About / Help & Documentation
            </h1>
            <CardDescription className="mt-1 text-base">
              Documentation, onboarding guides, FAQ, and support
            </CardDescription>
          </div>
          <HelpNavTabs />
        </CardHeader>
        <CardContent className="px-4 pb-6 sm:px-6 md:px-8 md:pb-8">
          <main
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              aria-label={`${activeTab.replace(/-/g, ' ')} content`}
              className="min-h-[400px] py-4"
            >
              {ActiveSection ? (
                <ActiveSection />
              ) : (
                <EmptyHelpState
                  onReset={() =>
                    navigate({ pathname: location.pathname, hash: 'getting-started' })
                  }
                />
              )}
            </main>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyHelpState({ onReset }: { onReset: () => void }) {
  return (
    <Card className="border-dashed border-border bg-muted/30">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-muted"
          aria-hidden
        >
          <HelpCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="mt-4 text-lg font-semibold text-foreground">
          Section not found
        </h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          The requested help section could not be loaded. Please try selecting a
          different section from the navigation above.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={onReset}
          aria-label="Return to Getting Started section"
        >
          Go to Getting Started
        </Button>
      </CardContent>
    </Card>
  )
}
