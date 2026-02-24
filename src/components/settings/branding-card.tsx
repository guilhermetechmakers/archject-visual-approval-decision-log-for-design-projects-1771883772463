import { useState, useCallback, useEffect } from 'react'
import { Upload, Palette, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useSettingsWorkspace, useUpdateWorkspaceBranding } from '@/hooks/use-settings'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const DOMAIN_PREFIX_REGEX = /^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$/
const HEX_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

export function BrandingCard() {
  const { data: workspace, isLoading } = useSettingsWorkspace()
  const updateMutation = useUpdateWorkspaceBranding()
  const [logoUrl, setLogoUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#195C4A')
  const [domainPrefix, setDomainPrefix] = useState('')
  const [headerText, setHeaderText] = useState('')
  const [footerText, setFooterText] = useState('')
  const [customCss, setCustomCss] = useState('')
  const [domainError, setDomainError] = useState<string | null>(null)
  const [colorError, setColorError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const branding: Partial<import('@/types/settings').WorkspaceBranding> = workspace?.branding ?? {}

  useEffect(() => {
    if (!workspace?.branding) return
    const b = workspace.branding
    queueMicrotask(() => {
      if (b.logoUrl) setLogoUrl(b.logoUrl)
      if (b.accentColor) setAccentColor(b.accentColor)
      if (b.domainPrefix) setDomainPrefix(b.domainPrefix)
      if (b.headerText) setHeaderText(b.headerText)
      if (b.footerText) setFooterText(b.footerText)
      if (b.customCss) setCustomCss(b.customCss)
    })
  }, [workspace?.id, workspace?.branding])

  const displayLogoUrl = logoUrl || branding.logoUrl || ''
  const displayAccent = accentColor || branding.accentColor || '#195C4A'
  const displayPrefix = domainPrefix || branding.domainPrefix || ''
  const displayHeader = headerText || branding.headerText || ''
  const displayFooter = footerText || branding.footerText || ''
  const displayCustomCss = customCss || branding.customCss || ''
  const clientPortalUrl = branding.clientPortalUrl || `https://clients.archject.app/${displayPrefix || 'your-studio'}`

  const validateDomainPrefix = useCallback((value: string) => {
    if (!value) return true
    if (value.length < 3 || value.length > 63) return false
    return DOMAIN_PREFIX_REGEX.test(value)
  }, [])

  const validateColor = useCallback((value: string) => {
    if (!value) return true
    return HEX_REGEX.test(value) || value.startsWith('rgb')
  }, [])

  const handleSave = async () => {
    setDomainError(null)
    setColorError(null)
    if (!validateDomainPrefix(domainPrefix || displayPrefix)) {
      setDomainError('Use 3–63 characters, alphanumeric and hyphens only')
      return
    }
    if (!validateColor(accentColor || displayAccent)) {
      setColorError('Use a valid 6-digit hex color (e.g. #195C4A)')
      return
    }
    try {
      await updateMutation.mutateAsync({
        logoUrl: displayLogoUrl || null,
        accentColor: accentColor || displayAccent,
        domainPrefix: (domainPrefix !== undefined ? domainPrefix : displayPrefix) || null,
        headerText: displayHeader || null,
        footerText: displayFooter || null,
        customCss: displayCustomCss || null,
      })
      toast.success('Branding saved')
    } catch {
      toast.error('Failed to save branding')
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      toast.error('Use PNG, JPG or SVG under 5MB')
      return
    }
    const url = URL.createObjectURL(file)
    setLogoUrl(url)
    toast.success('Logo selected')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect({ target: { files: [file] } } as unknown as React.ChangeEvent<HTMLInputElement>)
  }

  if (isLoading) return null

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-primary" />
          <CardTitle>Workspace branding</CardTitle>
        </div>
        <CardDescription>
          Logo, accent color, and client portal URL for client-facing links
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Logo</Label>
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-secondary/50 text-sm text-muted-foreground transition-colors',
              isDragging && 'border-primary bg-primary/5'
            )}
          >
            <input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml"
              className="hidden"
              id="logo-upload"
              onChange={handleFileSelect}
            />
            <label htmlFor="logo-upload" className="flex cursor-pointer flex-col items-center gap-2">
              {displayLogoUrl ? (
                <img
                  src={displayLogoUrl}
                  alt="Logo preview"
                  className="max-h-16 max-w-32 object-contain"
                />
              ) : (
                <>
                  <Upload className="h-8 w-8" />
                  <span>Drag & drop or click to upload</span>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accent-color">Accent color</Label>
          <div className="flex gap-2">
            <Input
              id="accent-color"
              type="text"
              placeholder="#195C4A"
              value={accentColor || displayAccent}
              onChange={(e) => { setAccentColor(e.target.value); setColorError(null) }}
              className={cn('max-w-[140px]', colorError && 'border-destructive')}
            />
            <input
              type="color"
              value={displayAccent.startsWith('#') ? displayAccent : '#195C4A'}
              onChange={(e) => setAccentColor(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-border"
              aria-label="Pick accent color"
            />
          </div>
          {colorError && <p className="text-xs text-destructive">{colorError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="header-text">Header text</Label>
          <Input
            id="header-text"
            type="text"
            placeholder="Design Approval Portal"
            value={headerText || displayHeader}
            onChange={(e) => setHeaderText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Shown at the top of client-facing decision logs
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="footer-text">Footer text</Label>
          <Input
            id="footer-text"
            type="text"
            placeholder="Powered by Archject"
            value={footerText || displayFooter}
            onChange={(e) => setFooterText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Shown at the bottom of client-facing pages
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-css">Custom CSS</Label>
          <Textarea
            id="custom-css"
            placeholder=".client-portal { font-family: sans-serif; }"
            value={customCss || displayCustomCss}
            onChange={(e) => setCustomCss(e.target.value)}
            rows={4}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Optional CSS for client-facing decision logs. Use with caution.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain-prefix">URL prefix</Label>
          <Input
            id="domain-prefix"
            type="text"
            placeholder="your-studio"
            value={domainPrefix || displayPrefix}
            onChange={(e) => { setDomainPrefix(e.target.value); setDomainError(null) }}
            className={cn(domainError && 'border-destructive')}
          />
          <p className="text-xs text-muted-foreground">
            3–63 chars, alphanumeric and hyphens. Used in client portal URL.
          </p>
          {domainError && <p className="text-xs text-destructive">{domainError}</p>}
        </div>

        <div className="space-y-2">
          <Label>Client portal link preview</Label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2">
            <code className="flex-1 truncate text-sm text-muted-foreground">
              {clientPortalUrl}
            </code>
            <Button variant="ghost" size="icon-sm" asChild>
              <a href={clientPortalUrl} target="_blank" rel="noopener noreferrer" aria-label="Open preview">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="transition-all duration-200 hover:scale-[1.02]"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save branding'}
        </Button>
      </CardContent>
    </Card>
  )
}
