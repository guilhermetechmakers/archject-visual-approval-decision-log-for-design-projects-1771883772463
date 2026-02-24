import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Plug, Plus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

const brandingSchema = z.object({
  workspaceName: z.string().min(1, 'Workspace name is required'),
})

const notificationsSchema = z.object({
  emailNotifications: z.boolean(),
  inAppNotifications: z.boolean(),
})

type ChangePasswordForm = z.infer<typeof changePasswordSchema>
type BrandingForm = z.infer<typeof brandingSchema>
type NotificationsForm = z.infer<typeof notificationsSchema>

function IntegrationsEmptyState() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center animate-fade-in"
      role="status"
      aria-label="No integrations connected"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <Plug className="h-7 w-7 text-muted-foreground" aria-hidden />
      </div>
      <h2 className="mt-6 text-lg font-semibold text-foreground">
        No integrations connected
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Connect Google Calendar, Autodesk Forge, Zapier, and more to streamline your decision
        workflows. Integrations sync approvals, reminders, and webhooks.
      </p>
      <Button
        className="mt-6 rounded-full transition-all duration-200 hover:scale-[1.02]"
        aria-label="Explore available integrations"
      >
        <Plus className="mr-2 h-4 w-4" />
        Explore integrations
      </Button>
    </div>
  )
}

export function SettingsPage() {
  const { logout } = useAuth()
  const [showPasswords, setShowPasswords] = useState(false)
  const integrations: unknown[] = []

  const changePasswordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
  })

  const brandingForm = useForm<BrandingForm>({
    resolver: zodResolver(brandingSchema),
    defaultValues: { workspaceName: 'My Studio' },
  })

  const notificationsForm = useForm<NotificationsForm>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      emailNotifications: true,
      inAppNotifications: true,
    },
  })

  const onPasswordSubmit = async (_data: ChangePasswordForm) => {
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success('Password updated')
      changePasswordForm.reset()
    } catch {
      toast.error('Failed to update password')
    }
  }

  const onBrandingSubmit = async (data: BrandingForm) => {
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success('Branding saved')
      brandingForm.reset(data)
    } catch {
      toast.error('Failed to save branding')
    }
  }

  const onNotificationsSubmit = async (data: NotificationsForm) => {
    try {
      await new Promise((r) => setTimeout(r, 400))
      toast.success('Notification preferences saved')
      notificationsForm.reset(data)
    } catch {
      toast.error('Failed to save preferences')
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-2 rounded-lg bg-secondary p-1 sm:grid-cols-5">
          <TabsTrigger
            value="account"
            className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Branding
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Integrations
          </TabsTrigger>
          <TabsTrigger
            value="data"
            className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Data
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="mt-6">
          <Card className="rounded-xl border border-border bg-card shadow-card">
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
                      className="pr-10 bg-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPasswords ? 'Hide password' : 'Show password'}
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
                    className="bg-input"
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
                    className="bg-input"
                  />
                  {changePasswordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {changePasswordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button type="submit" className="rounded-full transition-all duration-200 hover:scale-[1.02]">
                    Update password
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => logout()}
                    className="rounded-full"
                  >
                    Sign out
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="branding" className="mt-6">
          <Card className="rounded-xl border border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle>Workspace branding</CardTitle>
              <CardDescription>
                Customize how your workspace appears to clients
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={brandingForm.handleSubmit(onBrandingSubmit)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Workspace name</Label>
                  <Input
                    id="workspace-name"
                    className="bg-input"
                    {...brandingForm.register('workspaceName')}
                  />
                  {brandingForm.formState.errors.workspaceName && (
                    <p className="text-sm text-destructive">
                      {brandingForm.formState.errors.workspaceName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo</Label>
                  <div
                    className={cn(
                      'flex h-24 w-24 items-center justify-center rounded-lg border border-dashed',
                      'border-border bg-muted/50 text-sm text-muted-foreground'
                    )}
                  >
                    Upload logo
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={brandingForm.formState.isSubmitting}
                  className="rounded-full transition-all duration-200 hover:scale-[1.02]"
                >
                  {brandingForm.formState.isSubmitting ? 'Saving...' : 'Save changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <Card className="rounded-xl border border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle>Notification preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}
                className="space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Configure email and in-app notifications.
                </p>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <Label htmlFor="email-notifications" className="cursor-pointer font-medium">
                      Email notifications
                    </Label>
                    <Switch
                      id="email-notifications"
                      checked={notificationsForm.watch('emailNotifications')}
                      onCheckedChange={(v) =>
                        notificationsForm.setValue('emailNotifications', v, { shouldValidate: true })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-4">
                    <Label htmlFor="inapp-notifications" className="cursor-pointer font-medium">
                      In-app notifications
                    </Label>
                    <Switch
                      id="inapp-notifications"
                      checked={notificationsForm.watch('inAppNotifications')}
                      onCheckedChange={(v) =>
                        notificationsForm.setValue('inAppNotifications', v, { shouldValidate: true })
                      }
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={notificationsForm.formState.isSubmitting}
                  className="rounded-full transition-all duration-200 hover:scale-[1.02]"
                >
                  {notificationsForm.formState.isSubmitting ? 'Saving...' : 'Save preferences'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="mt-6">
          <Card className="rounded-xl border border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>
                Connect calendar, BIM viewers, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              {integrations.length === 0 ? (
                <IntegrationsEmptyState />
              ) : (
                <p className="text-sm text-muted-foreground">Your connected integrations.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="data" className="mt-6">
          <Card className="rounded-xl border border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle>Data & privacy</CardTitle>
              <CardDescription>
                Export or delete your data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row">
              <Button variant="outline" className="rounded-full">
                Export all data
              </Button>
              <Button variant="destructive" className="rounded-full">
                Delete workspace
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
