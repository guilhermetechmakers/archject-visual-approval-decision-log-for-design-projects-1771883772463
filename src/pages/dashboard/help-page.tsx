import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
  const hash = location.hash.slice(1) as HelpTab | ''
  const activeTab =
    hash && SECTIONS.some((s) => s.id === hash) ? hash : 'getting-started'

  useEffect(() => {
    const el = document.getElementById(`panel-${activeTab}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [activeTab])

  const ActiveSection = SECTIONS.find((s) => s.id === activeTab)?.Component

  return (
    <div className="space-y-8 animate-fade-in">
      <header>
        <h1 className="text-2xl font-bold text-foreground">
          About / Help & Documentation
        </h1>
        <p className="mt-1 text-muted-foreground">
          Documentation, onboarding guides, FAQ, and support
        </p>
      </header>

      <HelpNavTabs />

      <main
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="min-h-[400px]"
      >
        {ActiveSection && <ActiveSection />}
      </main>
    </div>
  )
}
