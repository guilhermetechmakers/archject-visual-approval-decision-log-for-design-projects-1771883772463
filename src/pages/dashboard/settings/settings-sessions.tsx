import { SessionsCard } from '@/components/settings'

export function SettingsSessions() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
        <p className="mt-1 text-muted-foreground">
          Active devices and session management
        </p>
      </div>
      <SessionsCard />
    </div>
  )
}
