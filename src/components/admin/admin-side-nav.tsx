/**
 * Admin left-hand secondary navigation - collapsible sections.
 */

import * as React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Wrench,
  Settings,
  ToggleLeft,
  FileText,
  CreditCard,
  History,
  FileArchive,
  FileClock,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavSection {
  title: string
  items: { to: string; icon: React.ElementType; label: string }[]
}

const SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/users', icon: Users, label: 'User Management' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { to: '/admin/tools', icon: Wrench, label: 'Tools & Moderation' },
      { to: '/admin/billing', icon: CreditCard, label: 'Billing & Invoices' },
    ],
  },
  {
    title: 'Compliance',
    items: [
      { to: '/admin/governance', icon: Shield, label: 'Governance' },
      { to: '/admin/audit-logs', icon: History, label: 'Audit Logs' },
      { to: '/admin/data-exports', icon: FileArchive, label: 'Data Exports' },
      { to: '/admin/retention-policies', icon: FileClock, label: 'Retention Policies' },
      { to: '/admin/privacy-controls', icon: Shield, label: 'Privacy Controls' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
      { to: '/admin/settings', icon: ToggleLeft, label: 'Feature Toggles' },
      { to: '/admin/settings', icon: FileText, label: 'Docs' },
    ],
  },
]

interface AdminSideNavProps {
  collapsed: boolean
  onToggle: () => void
  onNavigate?: () => void
  className?: string
}

export function AdminSideNav({ collapsed, onToggle, onNavigate, className }: AdminSideNavProps) {
  const location = useLocation()

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[72px]' : 'w-64',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        {!collapsed && (
          <span className="text-sm font-semibold text-foreground">Admin</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-4" aria-label="Admin sections">
        {SECTIONS.map((section) => (
          <div key={section.title} className={cn('mb-6', collapsed && 'mb-4')}>
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive =
                  location.pathname === item.to ||
                  (item.to === '/admin/governance' && location.pathname.startsWith('/admin/governance')) ||
                  (item.to === '/admin/settings' &&
                    location.pathname.startsWith('/admin/settings') &&
                    !['/admin/audit-logs', '/admin/data-exports', '/admin/retention-policies', '/admin/privacy-controls', '/admin/governance'].includes(location.pathname))
                const Icon = item.icon
                return (
                  <li key={`${item.to}-${item.label}`}>
                    <NavLink
                      to={item.to}
                      end={item.to === '/admin/dashboard'}
                      onClick={onNavigate}
                      className={({ isActive: linkActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                          linkActive || isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                          collapsed && 'justify-center px-2'
                        )
                      }
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
