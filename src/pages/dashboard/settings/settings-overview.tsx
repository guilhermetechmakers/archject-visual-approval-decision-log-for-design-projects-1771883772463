import { Link } from 'react-router-dom'
import {
  User,
  Palette,
  Bell,
  Plug,
  Key,
  Download,
  CreditCard,
  ChevronRight,
  Monitor,
  Shield,
  Users,
  FileClock,
  Lock,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const QUICK_LINKS = [
  { to: '/dashboard/settings/account', icon: User, label: 'Account', desc: 'Profile, avatar & password' },
  { to: '/dashboard/settings/branding', icon: Palette, label: 'Branding', desc: 'Logo, colors & client portal' },
  { to: '/dashboard/settings/notifications', icon: Bell, label: 'Notifications', desc: 'Channels & reminders' },
  { to: '/dashboard/settings/integrations', icon: Plug, label: 'Integrations', desc: 'Calendar, Forge, Zapier' },
  { to: '/dashboard/settings/api-keys', icon: Key, label: 'API Keys', desc: 'Keys & scoped permissions' },
  { to: '/dashboard/settings/data-export', icon: Download, label: 'Data Export', desc: 'Export & retention' },
  { to: '/dashboard/settings/retention-policy', icon: FileClock, label: 'Retention Policy', desc: 'Data retention & legal hold' },
  { to: '/dashboard/settings/privacy-controls', icon: Lock, label: 'Privacy Controls', desc: 'Masking & access controls' },
  { to: '/dashboard/settings/sessions', icon: Monitor, label: 'Sessions', desc: 'Active devices & sign out' },
  { to: '/dashboard/settings/security', icon: Shield, label: 'Security', desc: '2FA & compliance' },
  { to: '/dashboard/settings/team', icon: Users, label: 'Team', desc: 'Members & roles' },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing', desc: 'Plan & invoices' },
] as const

export function SettingsOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, workspace, and preferences
        </p>
      </div>

      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <CardTitle>Quick access</CardTitle>
          <CardDescription>
            Jump to a settings section
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map(({ to, icon: Icon, label, desc }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-4 rounded-xl border border-border p-4 transition-all duration-200',
                  'hover:border-primary/30 hover:bg-secondary/50 hover:shadow-card'
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-muted-foreground truncate">{desc}</p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
