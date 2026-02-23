import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
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

export function SettingsPage() {
  const { logout } = useAuth()
  const [showPasswords, setShowPasswords] = useState(false)

  const changePasswordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onPasswordSubmit = async (_data: ChangePasswordForm) => {
    try {
      // Mock: in production call authApi.changePassword
      await new Promise((r) => setTimeout(r, 400))
      toast.success('Password updated')
      changePasswordForm.reset()
    } catch {
      toast.error('Failed to update password')
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>
                Update your password. You will need your current password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={changePasswordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords ? 'text' : 'password'}
                      {...changePasswordForm.register('currentPassword')}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPasswords ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {changePasswordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {changePasswordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type={showPasswords ? 'text' : 'password'}
                    {...changePasswordForm.register('newPassword')}
                  />
                  {changePasswordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {changePasswordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPasswords ? 'text' : 'password'}
                    {...changePasswordForm.register('confirmPassword')}
                  />
                  {changePasswordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {changePasswordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button type="submit">Update password</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logout()}
                  >
                    Sign out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workspace branding</CardTitle>
              <CardDescription>
                Customize how your workspace appears to clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace name</Label>
                <Input id="workspace-name" defaultValue="My Studio" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo</Label>
                <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-border border-dashed bg-secondary/50 text-sm text-muted-foreground">
                  Upload logo
                </div>
              </div>
              <Button>Save changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configure email and in-app notifications.</p>
              <Button className="mt-4">Save preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect calendar, BIM viewers, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Integrations coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="data" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data & privacy</CardTitle>
              <CardDescription>
                Export or delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline">Export all data</Button>
              <Button variant="destructive">Delete workspace</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
