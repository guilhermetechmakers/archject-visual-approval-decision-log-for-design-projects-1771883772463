import { Bell, Mail, Smartphone, MessageSquare, Building2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NotificationPreview } from './notification-preview'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useSettingsNotifications, useUpdateNotifications } from '@/hooks/use-settings'
import { useSettingsWorkspace } from '@/hooks/use-settings'
import { toast } from 'sonner'

const CHANNEL_LABELS = {
  inApp: { icon: Bell, label: 'In-app' },
  email: { icon: Mail, label: 'Email' },
  sms: { icon: Smartphone, label: 'SMS' },
} as const

export function NotificationsCard() {
  const { data: settings, isLoading } = useSettingsNotifications()
  const { data: workspace } = useSettingsWorkspace()
  const updateMutation = useUpdateNotifications()

  const channels = settings?.channels ?? {
    approvals: { inApp: true, email: true, sms: false },
    comments: { inApp: true, email: true, sms: false },
    reminders: { inApp: true, email: true, sms: false },
  }

  const handleToggle = async (
    category: keyof typeof channels,
    channel: keyof (typeof channels)['approvals'],
    value: boolean
  ) => {
    const next = {
      ...channels,
      [category]: { ...channels[category], [channel]: value },
    }
    try {
      await updateMutation.mutateAsync({ channels: next, reminderSchedule: settings?.reminderSchedule })
      toast.success('Preferences updated')
    } catch {
      toast.error('Failed to update')
    }
  }

  if (isLoading) return null

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle>Notification preferences</CardTitle>
        </div>
        <CardDescription>
          Per-user defaults. Per-workspace overrides inherit from these when not set.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {workspace && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Workspace: {workspace.name}</span>
            <span className="text-xs text-muted-foreground">— using global defaults</span>
          </div>
        )}
        {(['approvals', 'comments', 'reminders'] as const).map((category) => (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium capitalize">{category}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {(Object.keys(CHANNEL_LABELS) as (keyof typeof CHANNEL_LABELS)[]).map((ch) => {
                const Icon = CHANNEL_LABELS[ch].icon
                const isOn = channels[category][ch]
                return (
                  <div
                    key={ch}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={`${category}-${ch}`} className="cursor-pointer">
                        {CHANNEL_LABELS[ch].label}
                      </Label>
                    </div>
                    <Switch
                      id={`${category}-${ch}`}
                      checked={isOn}
                      onCheckedChange={(checked) => handleToggle(category, ch, checked)}
                      disabled={updateMutation.isPending}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        <NotificationPreview settings={settings} />

        <Button
          onClick={() => {
            updateMutation.mutate(
              { channels, reminderSchedule: settings?.reminderSchedule },
              { onSuccess: () => toast.success('Preferences saved') }
            )
          }}
          disabled={updateMutation.isPending}
          className="transition-all duration-200 hover:scale-[1.02]"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save preferences'}
        </Button>
      </CardContent>
    </Card>
  )
}
