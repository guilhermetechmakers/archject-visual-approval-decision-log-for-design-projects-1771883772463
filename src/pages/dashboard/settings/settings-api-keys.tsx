import { ApiKeysCard } from '@/components/settings'

export function SettingsApiKeys() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Keys</h1>
        <p className="mt-1 text-muted-foreground">
          Generate, rotate, and revoke API keys
        </p>
      </div>
      <ApiKeysCard />
    </div>
  )
}
