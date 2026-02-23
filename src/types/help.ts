export interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
}

export interface GuideStep {
  id: string
  label: string
  completed: boolean
}

export interface Guide {
  id: string
  title: string
  steps: GuideStep[]
  summary: string
}

export interface ChangelogEntry {
  version: string
  date: string
  notes: string
}

export interface SupportRequest {
  id: string
  subject: string
  description: string
  priority: 'Low' | 'Medium' | 'High'
  attachmentName?: string
  createdAt: string
}

export type HelpTab =
  | 'getting-started'
  | 'knowledge-base'
  | 'faq'
  | 'onboarding-guides'
  | 'changelog'
  | 'contact-support'
