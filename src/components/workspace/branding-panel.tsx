import { useState } from 'react'
import { Upload, Palette } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { BrandingConfig } from '@/types/client-portal'

export interface BrandingPanelProps {
  branding: BrandingConfig
  onSave?: (branding: BrandingConfig) => Promise<void>
  className?: string
}

const COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export function BrandingPanel({
  branding,
  onSave,
  className,
}: BrandingPanelProps) {
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl ?? '')
  const [accentColor, setAccentColor] = useState(
    branding.accentColor ?? '#195C4A'
  )
  const [secondaryColor, setSecondaryColor] = useState(
    branding.secondaryColor ?? '#7BE495'
  )
  const [domainPrefix, setDomainPrefix] = useState(
    branding.domainPrefix ?? ''
  )
  const [customDomain, setCustomDomain] = useState(
    branding.customDomain ?? ''
  )
  const [isSaving, setIsSaving] = useState(false)
  const [accentError, setAccentError] = useState<string | null>(null)
  const [secondaryError, setSecondaryError] = useState<string | null>(null)

  const validateColor = (value: string) =>
    !value || COLOR_REGEX.test(value) || value.startsWith('rgb')

  const handleSave = async () => {
    setAccentError(null)
    setSecondaryError(null)
    if (!validateColor(accentColor)) {
      setAccentError('Invalid color (use #hex or rgb)')
      return
    }
    if (!validateColor(secondaryColor)) {
      setSecondaryError('Invalid color (use #hex or rgb)')
      return
    }
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave({
        logoUrl: logoUrl || null,
        accentColor: accentColor || undefined,
        secondaryColor: secondaryColor || undefined,
        domainPrefix: domainPrefix || null,
        customDomain: customDomain || null,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card
      className={cn(
        'rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Workspace Branding</CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">
          Customize logo, colors, and domain for client-facing links.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="logo-url">Logo URL</Label>
          <div className="flex gap-2">
            <Input
              id="logo-url"
              type="url"
              placeholder="https://..."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
            />
            <Button variant="outline" size="icon" aria-label="Upload logo">
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {logoUrl && (
            <div className="mt-2 flex h-12 w-24 items-center justify-center rounded-lg border border-border bg-secondary/30">
              <img
                src={logoUrl}
                alt="Logo preview"
                className="max-h-10 max-w-20 object-contain"
                onError={() => setLogoUrl('')}
              />
            </div>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="accent-color">Primary / Accent color</Label>
            <div className="flex gap-2">
              <Input
                id="accent-color"
                type="text"
                placeholder="#195C4A"
                value={accentColor}
                onChange={(e) => {
                  setAccentColor(e.target.value)
                  setAccentError(null)
                }}
                className={accentError ? 'border-destructive' : ''}
              />
              <input
                type="color"
                value={accentColor.startsWith('#') ? accentColor : '#195C4A'}
                onChange={(e) => setAccentColor(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded border border-border"
              />
            </div>
            {accentError && (
              <p className="text-xs text-destructive">{accentError}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secondary color</Label>
            <div className="flex gap-2">
              <Input
                id="secondary-color"
                type="text"
                placeholder="#7BE495"
                value={secondaryColor}
                onChange={(e) => {
                  setSecondaryColor(e.target.value)
                  setSecondaryError(null)
                }}
                className={secondaryError ? 'border-destructive' : ''}
              />
              <input
                type="color"
                value={
                  secondaryColor.startsWith('#') ? secondaryColor : '#7BE495'
                }
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="h-10 w-12 cursor-pointer rounded border border-border"
              />
            </div>
            {secondaryError && (
              <p className="text-xs text-destructive">{secondaryError}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain-prefix">URL prefix (optional)</Label>
          <Input
            id="domain-prefix"
            type="text"
            placeholder="clients"
            value={domainPrefix}
            onChange={(e) => setDomainPrefix(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            e.g. clients.yourstudio.com
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-domain">Custom domain (optional)</Label>
          <Input
            id="custom-domain"
            type="text"
            placeholder="review.yourstudio.com"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
          />
        </div>

        {onSave && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="transition-all duration-200 hover:scale-[1.02]"
          >
            {isSaving ? 'Saving...' : 'Save branding'}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
