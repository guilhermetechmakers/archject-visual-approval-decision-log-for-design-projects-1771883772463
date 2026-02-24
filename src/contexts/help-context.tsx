/* eslint-disable react-refresh/only-export-components -- context file exports provider + hook */
import * as React from 'react'
import { useSearchParams } from 'react-router-dom'
import type { HelpTab } from '@/types/help'

const TAB_PARAM = 'tab'
const VALID_TABS: HelpTab[] = [
  'getting-started',
  'knowledge-base',
  'faq',
  'onboarding-guides',
  'changelog',
  'contact-support',
]

interface HelpContextValue {
  activeTab: HelpTab
  setActiveTab: (tab: HelpTab) => void
  kbQuery: string
  setKbQuery: (q: string) => void
  kbCategory: string
  setKbCategory: (c: string) => void
  faqCategory: string
  setFaqCategory: (c: string) => void
  selectedArticleId: string | null
  setSelectedArticleId: (id: string | null) => void
}

const HelpContext = React.createContext<HelpContextValue | null>(null)

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get(TAB_PARAM)
  const activeTab = VALID_TABS.includes(tabParam as HelpTab)
    ? (tabParam as HelpTab)
    : 'getting-started'

  const [kbQuery, setKbQuery] = React.useState('')
  const [kbCategory, setKbCategory] = React.useState('')
  const [faqCategory, setFaqCategory] = React.useState('')
  const [selectedArticleId, setSelectedArticleId] = React.useState<string | null>(
    null
  )

  const setActiveTab = React.useCallback(
    (tab: HelpTab) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set(TAB_PARAM, tab)
        return next
      })
    },
    [setSearchParams]
  )

  const value: HelpContextValue = {
    activeTab,
    setActiveTab,
    kbQuery,
    setKbQuery,
    kbCategory,
    setKbCategory,
    faqCategory,
    setFaqCategory,
    selectedArticleId,
    setSelectedArticleId,
  }

  return (
    <HelpContext.Provider value={value}>{children}</HelpContext.Provider>
  )
}

export function useHelpContext() {
  const ctx = React.useContext(HelpContext)
  if (!ctx) {
    throw new Error('useHelpContext must be used within HelpProvider')
  }
  return ctx
}
