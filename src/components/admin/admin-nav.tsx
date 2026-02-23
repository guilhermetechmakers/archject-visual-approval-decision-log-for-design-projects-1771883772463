/**
 * Admin top navigation - pill-shaped tabs with deep green active state.
 */

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, Wrench, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/tools', icon: Wrench, label: 'Tools & Moderation' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
] as const

export function AdminNav() {
  return (
    <nav
      className="flex items-center gap-1 rounded-full bg-secondary p-1"
      role="tablist"
      aria-label="Admin navigation"
    >
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/admin/dashboard'}
          role="tab"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
