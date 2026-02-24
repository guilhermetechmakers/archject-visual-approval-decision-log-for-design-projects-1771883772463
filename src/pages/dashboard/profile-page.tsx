/**
 * Profile page - user profile with avatar, editable fields, password change, sessions.
 * Consolidated view for page_profile per User Profile Management spec.
 */

import { Link } from 'react-router-dom'
import {
  ConnectedAccountsCard,
  SessionsCard,
  SecurityCard,
  PasswordChangeCard,
} from '@/components/settings'
import { AvatarUploader } from '@/components/profile'
import { useSettingsProfile, useUploadAvatar } from '@/hooks/use-settings'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shimmer } from '@/components/loading/shimmer'
import { User, Settings } from 'lucide-react'
import { toast } from 'sonner'

function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
      <Shimmer className="h-24 w-24 shrink-0 rounded-full" aria-hidden />
      <div className="space-y-2">
        <Shimmer className="h-10 w-48" aria-hidden />
        <Shimmer className="h-4 w-32" aria-hidden />
      </div>
    </div>
  )
}

export function ProfilePage() {
  const { logout } = useAuth()
  const { data: profile, isLoading } = useSettingsProfile()
  const uploadAvatar = useUploadAvatar()

  const handleAvatarFileSelect = (file: File) => {
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success('Avatar updated'),
      onError: () => toast.error('Failed to upload avatar'),
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account, connected providers, and security settings
        </p>
      </div>

      {/* Profile header with avatar */}
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
        <CardContent className="space-y-6">
          {isLoading ? (
            <ProfileHeaderSkeleton />
          ) : (
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              <div className="shrink-0">
                <AvatarUploader
                  value={profile?.avatar}
                  onFileSelect={handleAvatarFileSelect}
                  isUploading={uploadAvatar.isPending}
                  progress={uploadAvatar.isPending ? 50 : 0}
                  error={uploadAvatar.isError ? 'Upload failed' : null}
                  size="md"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <p className="text-lg font-semibold text-foreground">{profile?.name ?? '—'}</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.role ? `${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}` : '—'}
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email ?? ''} disabled className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={profile?.name ?? ''} disabled className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Time zone</Label>
                    <Input value={profile?.timeZone ?? '—'} disabled className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Locale</Label>
                    <Input value={profile?.locale ?? '—'} disabled className="bg-secondary/50" />
                  </div>
                </div>
                <Link to="/dashboard/settings/account">
                  <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-[1.02]">
                    <Settings className="mr-2 h-4 w-4" />
                    Edit in Settings
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <PasswordChangeCard />

      <ConnectedAccountsCard />

      <SessionsCard />

      <SecurityCard />

      <div className="flex flex-wrap gap-4">
        <Button variant="outline" onClick={() => logout()} className="transition-all duration-200 hover:scale-[1.02]">
          Sign out
        </Button>
        <Link to="/dashboard/settings">
          <Button variant="secondary" className="transition-all duration-200 hover:scale-[1.02]">
            All settings
          </Button>
        </Link>
      </div>
    </div>
  )
}
