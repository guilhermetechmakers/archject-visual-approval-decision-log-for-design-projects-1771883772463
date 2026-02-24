/**
 * Profile page - user profile, connected OAuth accounts, security settings (2FA, sessions).
 * Consolidated view for page_profile.
 */

import { Link } from 'react-router-dom'
import {
  ConnectedAccountsCard,
  SessionsCard,
  SecurityCard,
} from '@/components/settings'
import { useSettingsProfile } from '@/hooks/use-settings'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { User, Settings } from 'lucide-react'

export function ProfilePage() {
  const { logout } = useAuth()
  const { data: profile, isLoading } = useSettingsProfile()

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, connected providers, and security settings
        </p>
      </div>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profile information</CardTitle>
          </div>
          <CardDescription>
            Your account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email ?? ''} disabled className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={profile?.name ?? ''} disabled className="bg-secondary/50" />
              </div>
              <Link to="/dashboard/settings/account">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Edit in Settings
                </Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>

      <ConnectedAccountsCard />

      <SessionsCard />

      <SecurityCard />

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => logout()}>
          Sign out
        </Button>
        <Link to="/dashboard/settings">
          <Button variant="secondary">All settings</Button>
        </Link>
      </div>
    </div>
  )
}
