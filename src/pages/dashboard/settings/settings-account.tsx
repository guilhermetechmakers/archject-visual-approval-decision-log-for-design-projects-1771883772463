import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AvatarUploader } from '@/components/profile'
import { useAuth } from '@/contexts/auth-context'
import {
  useSettingsProfile,
  useUpdateProfile,
  useUploadAvatar,
} from '@/hooks/use-settings'
import { authApi, isApiError } from '@/api/auth'
import { PasswordStrengthIndicator, PASSWORD_POLICY } from '@/components/auth'
import { toast } from 'sonner'

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  timeZone: z.string().optional(),
  locale: z.string().optional(),
})

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(PASSWORD_POLICY.minLength, `Password must be at least ${PASSWORD_POLICY.minLength} characters`)
      .refine((p) => /[a-z]/.test(p), 'Include at least one lowercase letter')
      .refine((p) => /[A-Z]/.test(p), 'Include at least one uppercase letter')
      .refine((p) => /\d/.test(p), 'Include at least one number')
      .refine((p) => /[^a-zA-Z0-9]/.test(p), 'Include at least one special character'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type ChangePasswordForm = z.infer<typeof changePasswordSchema>

const COMMON_TIMEZONES = [
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'UTC',
]

const COMMON_LOCALES = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'ja', label: 'Japanese' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
]

export function SettingsAccount() {
  const { logout } = useAuth()
  const { data: profile } = useSettingsProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const [showPasswords, setShowPasswords] = useState(false)
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      timeZone: 'America/New_York',
      locale: 'en-US',
    },
  })

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const newPassword = passwordForm.watch('newPassword')

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        name: profile.name,
        timeZone: profile.timeZone ?? 'America/New_York',
        locale: profile.locale ?? 'en-US',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  const handleAvatarFileSelect = (file: File) => {
    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success('Avatar updated'),
      onError: () => toast.error('Failed to upload avatar'),
    })
  }

  const handleAvatarRemove = () => {
    updateProfile.mutate(
      { avatar: null },
      {
        onSuccess: () => toast.success('Avatar removed'),
        onError: () => toast.error('Failed to remove avatar'),
      }
    )
  }

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      await updateProfile.mutateAsync({
        name: data.name,
        timeZone: data.timeZone || undefined,
        locale: data.locale || undefined,
      })
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  const onPasswordSubmit = async (data: ChangePasswordForm) => {
    setIsPasswordSubmitting(true)
    try {
      await authApi.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Password changed successfully')
      passwordForm.reset()
    } catch (e) {
      if (isApiError(e)) {
        toast.error(e.message ?? 'Failed to update password')
      } else {
        toast.error('Failed to update password')
      }
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
        <p className="mt-1 text-muted-foreground">
          Profile details, avatar, and password
        </p>
      </div>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle>Profile</CardTitle>
          </div>
          <CardDescription>
            Your account information and avatar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <AvatarUploader
                value={profile?.avatar}
                onFileSelect={handleAvatarFileSelect}
                onRemove={handleAvatarRemove}
                isUploading={uploadAvatar.isPending}
                progress={uploadAvatar.isPending ? 50 : 0}
                error={uploadAvatar.isError ? 'Upload failed' : null}
                size="md"
              />
            </div>
            <form
              onSubmit={profileForm.handleSubmit(onProfileSubmit)}
              className="min-w-0 flex-1 space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email ?? ''}
                  disabled
                  className="bg-secondary/50"
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  {...profileForm.register('name')}
                  aria-invalid={!!profileForm.formState.errors.name}
                />
                {profileForm.formState.errors.name && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="timeZone">Time zone</Label>
                  <Select
                    value={profileForm.watch('timeZone') ?? 'America/New_York'}
                    onValueChange={(v) => profileForm.setValue('timeZone', v, { shouldDirty: true })}
                  >
                    <SelectTrigger id="timeZone">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>
                          {tz}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="locale">Locale</Label>
                  <Select
                    value={profileForm.watch('locale') ?? 'en-US'}
                    onValueChange={(v) => profileForm.setValue('locale', v, { shouldDirty: true })}
                  >
                    <SelectTrigger id="locale">
                      <SelectValue placeholder="Select locale" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_LOCALES.map((loc) => (
                        <SelectItem key={loc.value} value={loc.value}>
                          {loc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                type="submit"
                disabled={updateProfile.isPending || !profileForm.formState.isDirty}
                className="transition-all duration-200 hover:scale-[1.02]"
              >
                {updateProfile.isPending ? 'Saving...' : 'Save profile'}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Update your password. You will need your current password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  {...passwordForm.register('currentPassword')}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...passwordForm.register('newPassword')}
                aria-invalid={!!passwordForm.formState.errors.newPassword}
              />
              <PasswordStrengthIndicator password={newPassword ?? ''} />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive" role="alert">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={isPasswordSubmitting}>
                {isPasswordSubmitting ? 'Updating...' : 'Update password'}
              </Button>
              <Button type="button" variant="outline" onClick={() => logout()}>
                Sign out
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
