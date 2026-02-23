import { cn } from '@/lib/utils'

export type WorkspaceTab =
  | 'overview'
  | 'decisions'
  | 'files'
  | 'team'
  | 'templates'
  | 'activity'
  | 'settings'

export interface WorkspaceNavProps {
  activeTab: WorkspaceTab
  onTabChange: (tab: WorkspaceTab) => void
  className?: string
}

const tabs: { id: WorkspaceTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'files', label: 'Files & Drawings' },
  { id: 'team', label: 'Team & Permissions' },
  { id: 'templates', label: 'Templates' },
  { id: 'activity', label: 'Activity & Audit' },
  { id: 'settings', label: 'Settings' },
]

export function WorkspaceNav({
  activeTab,
  onTabChange,
  className,
}: WorkspaceNavProps) {
  return (
    <nav
      role="tablist"
      aria-label="Workspace sections"
      className={cn('flex flex-col gap-1', className)}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'rounded-full px-4 py-2.5 text-left text-sm font-medium transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
