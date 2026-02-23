import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/auth-context'
import { useSettingsProfile } from '@/hooks/use-settings'
import { toast } from 'sonner'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .refine(
        (p) => /\d/.test(p) || /[^a-zA-Z0-9]/.test(p),
        'Include a number or special character'
      ),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

export function SettingsAccount() {
  const { logout } = useAuth()
  const { data: profile } = useSettingsProfile()
  const [showPasswords, setShowPasswords] = useState(false)

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onPasswordSubmit = async (_data: ChangePasswordForm) => {
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success('Password updated')
      form.reset()
    } catch {
      toast.error('Failed to update password')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
        <p className="mt-1 text-muted-foreground">
          Profile details and password
        </p>
      </div>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={profile?.email ?? ''} disabled className="bg-secondary/50" />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={profile?.name ?? ''} disabled className="bg-secondary/50" />
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
            onSubmit={form.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  {...form.register('currentPassword')}
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
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                {...form.register('newPassword')}
              />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                {...form.register('confirmPassword')}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <Button type="submit">Update password</Button>
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
