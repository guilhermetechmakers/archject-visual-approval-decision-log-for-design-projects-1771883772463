/**
 * Admin top navigation - pill-shaped tabs with deep green active state.
 * Uses design tokens and full accessibility (aria-label, aria-selected).
 */

import { NavLink, useMatch } from 'react-router-dom'
import { LayoutDashboard, Users, Wrench, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/tools', icon: Wrench, label: 'Tools & Moderation' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
] as const

interface AdminNavItemProps {
  to: string
  label: string
  icon: React.ElementType
  end?: boolean
}

function AdminNavItem({ to, label, icon: Icon, end }: AdminNavItemProps) {
  const match = useMatch({ path: to, end: end ?? to === '/admin/dashboard' })
  const isActive = !!match

  return (
    <NavLink
      to={to}
      end={end}
      role="tab"
      aria-selected={isActive ? 'true' : 'false'}
      aria-label={isActive ? `${label}, current page` : `Go to ${label}`}
      id={`admin-nav-${to.replace(/\//g, '-').slice(1)}`}
      className={({ isActive: active }) =>
        cn(
          'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'min-h-[44px] min-w-[44px] touch-manipulation',
          active
            ? 'bg-primary text-primary-foreground shadow-card'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground hover:shadow-sm'
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      <span>{label}</span>
    </NavLink>
  )
}

export function AdminNav() {
  return (
    <nav
      className="flex flex-wrap items-center gap-1 overflow-x-auto rounded-full bg-secondary p-1"
      role="tablist"
      aria-label="Admin navigation"
    >
      {NAV_ITEMS.map(({ to, icon, label }) => (
        <AdminNavItem
          key={to}
          to={to}
          label={label}
          icon={icon}
          end={to === '/admin/dashboard'}
        />
      ))}
    </nav>
  )
}
