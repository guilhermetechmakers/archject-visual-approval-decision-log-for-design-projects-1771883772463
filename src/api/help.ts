import type {
  Article,
  FAQ,
  Guide,
  ChangelogEntry,
  SupportRequest,
} from '@/types/help'
import {
  MOCK_ARTICLES,
  MOCK_FAQS,
  MOCK_GUIDES,
  MOCK_CHANGELOG,
  MOCK_GETTING_STARTED_STEPS,
} from '@/lib/help-mock'

const STORAGE_KEY_GETTING_STARTED = 'archject_help_getting_started'
const STORAGE_KEY_GUIDES = 'archject_help_guides'
const STORAGE_KEY_SUPPORT = 'archject_help_support'

function getStoredGettingStarted() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_GETTING_STARTED)
    if (stored) {
      return JSON.parse(stored) as typeof MOCK_GETTING_STARTED_STEPS
    }
  } catch {
    // ignore
  }
  return MOCK_GETTING_STARTED_STEPS
}

function getStoredGuides() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_GUIDES)
    if (stored) {
      return JSON.parse(stored) as Guide[]
    }
  } catch {
    // ignore
  }
  return MOCK_GUIDES
}

export async function fetchGettingStarted(): Promise<typeof MOCK_GETTING_STARTED_STEPS> {
  await new Promise((r) => setTimeout(r, 200))
  return getStoredGettingStarted()
}

export async function updateGettingStartedStep(
  stepId: string,
  completed: boolean
): Promise<void> {
  await new Promise((r) => setTimeout(r, 100))
  const steps = getStoredGettingStarted()
  const updated = steps.map((s) =>
    s.id === stepId ? { ...s, completed } : s
  )
  localStorage.setItem(STORAGE_KEY_GETTING_STARTED, JSON.stringify(updated))
}

export async function fetchKnowledgeBase(params: {
  query?: string
  category?: string
  page?: number
}): Promise<{ articles: Article[]; total: number }> {
  await new Promise((r) => setTimeout(r, 250))
  let filtered = [...MOCK_ARTICLES]

  if (params.category) {
    filtered = filtered.filter(
      (a) => a.category.toLowerCase() === params.category!.toLowerCase()
    )
  }

  if (params.query?.trim()) {
    const q = params.query.trim().toLowerCase()
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  const total = filtered.length
  const page = params.page ?? 1
  const perPage = 10
  const start = (page - 1) * perPage
  const articles = filtered.slice(start, start + perPage)

  return { articles, total }
}

export async function fetchArticle(id: string): Promise<Article | null> {
  await new Promise((r) => setTimeout(r, 150))
  return MOCK_ARTICLES.find((a) => a.id === id) ?? null
}

export async function fetchFAQs(params?: {
  category?: string
}): Promise<FAQ[]> {
  await new Promise((r) => setTimeout(r, 150))
  if (params?.category) {
    return MOCK_FAQS.filter(
      (f) => f.category.toLowerCase() === params.category!.toLowerCase()
    )
  }
  return MOCK_FAQS
}

export async function fetchOnboardingGuides(): Promise<Guide[]> {
  await new Promise((r) => setTimeout(r, 150))
  return getStoredGuides()
}

export async function updateGuideStep(
  guideId: string,
  stepId: string,
  completed: boolean
): Promise<Guide[]> {
  await new Promise((r) => setTimeout(r, 100))
  const guides = getStoredGuides()
  const updated = guides.map((g) => {
    if (g.id !== guideId) return g
    return {
      ...g,
      steps: g.steps.map((s) =>
        s.id === stepId ? { ...s, completed } : s
      ),
    }
  })
  localStorage.setItem(STORAGE_KEY_GUIDES, JSON.stringify(updated))
  return updated
}

export async function fetchChangelog(): Promise<ChangelogEntry[]> {
  await new Promise((r) => setTimeout(r, 150))
  return MOCK_CHANGELOG
}

export async function submitContactSupport(
  data: Omit<SupportRequest, 'id' | 'createdAt'>
): Promise<SupportRequest> {
  await new Promise((r) => setTimeout(r, 300))
  const ticket: SupportRequest = {
    ...data,
    id: `ticket-${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  const stored = getStoredSupportTickets()
  stored.unshift(ticket)
  localStorage.setItem(STORAGE_KEY_SUPPORT, JSON.stringify(stored.slice(0, 50)))
  return ticket
}

function getStoredSupportTickets(): SupportRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SUPPORT)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore
  }
  return []
}

export const KNOWLEDGE_BASE_CATEGORIES = [
  'General',
  'Sharing',
  'Exports',
  'Billing',
  'Integrations',
] as const

export const FAQ_CATEGORIES = ['General', 'Sharing', 'Exports', 'Billing'] as const
