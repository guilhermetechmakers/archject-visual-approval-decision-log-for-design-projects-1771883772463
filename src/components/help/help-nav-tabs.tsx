import { useLocation, useNavigate } from 'react-router-dom'
import {
  Rocket,
  BookOpen,
  HelpCircle,
  GraduationCap,
  FileText,
  Mail,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { HelpTab } from '@/types/help'

const TABS: {
  id: HelpTab
  label: string
  icon: React.ElementType
  ariaLabel: string
}[] = [
  {
    id: 'getting-started',
    label: 'Getting Started',
    icon: Rocket,
    ariaLabel: 'Navigate to Getting Started section',
  },
  {
    id: 'knowledge-base',
    label: 'Knowledge Base',
    icon: BookOpen,
    ariaLabel: 'Navigate to Knowledge Base section',
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: HelpCircle,
    ariaLabel: 'Navigate to FAQ section',
  },
  {
    id: 'onboarding-guides',
    label: 'Onboarding Guides',
    icon: GraduationCap,
    ariaLabel: 'Navigate to Onboarding Guides section',
  },
  {
    id: 'changelog',
    label: 'Changelog',
    icon: FileText,
    ariaLabel: 'Navigate to Changelog section',
  },
  {
    id: 'contact-support',
    label: 'Contact Support',
    icon: Mail,
    ariaLabel: 'Navigate to Contact Support section',
  },
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

  const handleTabChange = (value: string) => {
    navigate({ pathname: location.pathname, hash: value }, { replace: true })
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn('w-full', className)}
    >
      <TabsList
        className="flex h-auto flex-wrap gap-2 rounded-full bg-secondary p-4"
        aria-label="Help documentation sections"
      >
        {TABS.map(({ id, label, icon: Icon, ariaLabel }) => (
          <TabsTrigger
            key={id}
            value={id}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm',
              'data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground',
              'hover:scale-[1.02] active:scale-[0.98]',
              'hover:data-[state=inactive]:bg-secondary/80 hover:data-[state=inactive]:text-foreground'
            )}
            aria-label={ariaLabel}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
