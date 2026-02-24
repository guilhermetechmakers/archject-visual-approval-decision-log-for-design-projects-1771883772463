import { BrandingCard } from '@/components/settings'

export function SettingsBranding() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Branding</h1>
        <p className="mt-1 text-muted-foreground">
          Logo, colors, and client portal URL
        </p>
      </div>
      <div className="space-y-6">
        <BrandingCard />
      </div>
    </div>
  )
}
