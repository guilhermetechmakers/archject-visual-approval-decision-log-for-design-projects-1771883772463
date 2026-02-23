import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  User,
  Palette,
  Bell,
  Plug,
  Key,
  Download,
  Monitor,
  Shield,
  Users,
  CreditCard,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SettingsSection } from '@/types/settings'

const NAV_ITEMS: { to: string; section: SettingsSection; icon: React.ElementType; label: string }[] = [
  { to: '/dashboard/settings', section: 'overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/settings/account', section: 'account', icon: User, label: 'Account' },
  { to: '/dashboard/settings/branding', section: 'branding', icon: Palette, label: 'Branding' },
  { to: '/dashboard/settings/notifications', section: 'notifications', icon: Bell, label: 'Notifications' },
  { to: '/dashboard/settings/integrations', section: 'integrations', icon: Plug, label: 'Integrations' },
  { to: '/dashboard/settings/api-keys', section: 'api-keys', icon: Key, label: 'API Keys' },
  { to: '/dashboard/settings/data-export', section: 'data-export', icon: Download, label: 'Data Export' },
  { to: '/dashboard/settings/sessions', section: 'sessions', icon: Monitor, label: 'Sessions' },
  { to: '/dashboard/settings/security', section: 'security', icon: Shield, label: 'Security & Compliance' },
  { to: '/dashboard/settings/team', section: 'team', icon: Users, label: 'Team & Users' },
  { to: '/dashboard/settings/billing', section: 'billing', icon: CreditCard, label: 'Billing' },
]

interface SettingsNavProps {
  collapsed?: boolean
  className?: string
  onNavigate?: () => void
}

export function SettingsNav({ collapsed = false, className, onNavigate }: SettingsNavProps) {
  return (
    <nav
      className={cn(
        'flex flex-col gap-1 transition-all duration-300',
        collapsed ? 'w-16' : 'w-56',
        className
      )}
      aria-label="Settings navigation"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/dashboard/settings'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              collapsed && 'justify-center px-2'
            )
          }
        >
          <Icon className="h-5 w-5 shrink-0" aria-hidden />
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  )
}
