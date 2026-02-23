import { useLocation, useNavigate } from 'react-router-dom'
import {
  Rocket,
  BookOpen,
  HelpCircle,
  GraduationCap,
  FileText,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HelpTab } from '@/types/help'

const TABS: { id: HelpTab; label: string; icon: React.ElementType }[] = [
  { id: 'getting-started', label: 'Getting Started', icon: Rocket },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'onboarding-guides', label: 'Onboarding Guides', icon: GraduationCap },
  { id: 'changelog', label: 'Changelog', icon: FileText },
  { id: 'contact-support', label: 'Contact Support', icon: Mail },
]

interface HelpNavTabsProps {
  className?: string
}

export function HelpNavTabs({ className }: HelpNavTabsProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const hash = location.hash.slice(1) as HelpTab | ''
  const activeTab =
    hash && TABS.some((t) => t.id === hash) ? hash : 'getting-started'

  const handleTab = (id: HelpTab) => {
    navigate({ pathname: location.pathname, hash: id }, { replace: true })
  }

  return (
    <nav
      role="tablist"
      aria-label="Help sections"
      className={cn('flex flex-wrap gap-2', className)}
    >
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={activeTab === id}
          aria-controls={`panel-${id}`}
          id={`tab-${id}`}
          onClick={() => handleTab(id)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'hover:scale-[1.02] active:scale-[0.98]',
            activeTab === id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          {label}
        </button>
      ))}
    </nav>
  )
}
