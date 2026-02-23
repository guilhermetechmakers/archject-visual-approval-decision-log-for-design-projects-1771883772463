import { NotificationsCard } from '@/components/settings'

export function SettingsNotifications() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <p className="mt-1 text-muted-foreground">
          In-app, email, and SMS preferences
        </p>
      </div>
      <NotificationsCard />
    </div>
  )
}
