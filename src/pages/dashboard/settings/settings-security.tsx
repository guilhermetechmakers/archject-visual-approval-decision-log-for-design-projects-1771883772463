import { SecurityCard, PasswordChangeCard } from '@/components/settings'

export function SettingsSecurity() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security & compliance</h1>
        <p className="mt-1 text-muted-foreground">
          Password, audit logs, 2FA, and privacy controls
        </p>
      </div>
      <div className="space-y-6">
        <PasswordChangeCard />
        <SecurityCard />
      </div>
    </div>
  )
}
