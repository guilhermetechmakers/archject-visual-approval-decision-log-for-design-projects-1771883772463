import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck,
  BarChart3,
  Users,
  Settings,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/dashboard/decisions', icon: FileCheck, label: 'Decisions' },
  { to: '/dashboard/team', icon: Users, label: 'Team' },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
  { to: '/dashboard/help', icon: HelpCircle, label: 'Help' },
  { to: '/admin/dashboard', icon: Shield, label: 'Admin' },
]

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
  className?: string
}

export function Sidebar({ collapsed = false, onToggle, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
        className
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <span className="text-lg font-semibold text-primary">Archject</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 hover:bg-secondary transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
