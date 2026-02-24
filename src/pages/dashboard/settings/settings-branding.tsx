/**
 * Settings Branding - Full Branding Studio
 * Asset upload, color tokens, domain/URL, live preview, validation
 */

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AssetUploader,
  ColorTokenEditor,
  DomainManager,
  PreviewPane,
} from '@/components/branding'
import { BrandingCard } from '@/components/settings'
import { useSettingsWorkspace, useUpdateWorkspaceBranding } from '@/hooks/use-settings'
import { brandingApi } from '@/api/branding'
import { useBranding, workspaceBrandingToTokens } from '@/contexts/branding-context'
import { toast } from 'sonner'
import type { WorkspaceBranding } from '@/types/settings'
import type { ColorTokens } from '@/types/branding'

export function SettingsBranding() {
  const { data: workspace, isLoading } = useSettingsWorkspace()
  const updateMutation = useUpdateWorkspaceBranding()
  const { setTokens } = useBranding()

  const branding: Partial<WorkspaceBranding> = workspace?.branding ?? {}

  const [logoUrl, setLogoUrl] = useState(branding.logoUrl ?? '')
  const [colorTokens, setColorTokens] = useState<Partial<ColorTokens>>({
    primary: branding.primaryColor ?? branding.accentColor ?? '#195C4A',
    accent: branding.accentColor ?? '#7BE495',
    secondary: branding.secondaryColor ?? '#7BE495',
  })
  const [domainPrefix, setDomainPrefix] = useState(branding.domainPrefix ?? '')
  const [headerText, setHeaderText] = useState(branding.headerText ?? '')
  const [footerText, setFooterText] = useState(branding.footerText ?? '')
  const [customCss, setCustomCss] = useState(branding.customCss ?? '')

  useEffect(() => {
    if (workspace?.branding) {
      const b = workspace.branding
      queueMicrotask(() => {
        setLogoUrl(b.logoUrl ?? '')
        setColorTokens({
          primary: b.primaryColor ?? b.accentColor ?? '#195C4A',
          accent: b.accentColor ?? '#7BE495',
          secondary: b.secondaryColor ?? '#7BE495',
        })
        setDomainPrefix(b.domainPrefix ?? '')
        setHeaderText(b.headerText ?? '')
        setFooterText(b.footerText ?? '')
        setCustomCss(b.customCss ?? '')
      })
    }
  }, [workspace?.id, workspace?.branding])

  const previewTokens = {
    logoUrl: logoUrl || branding.logoUrl,
    accentColor: colorTokens.accent ?? branding.accentColor,
    colorTokens,
    headerText: headerText || branding.headerText,
    footerText: footerText || branding.footerText,
  }

  const handleSave = useCallback(async () => {
    const payload: Partial<WorkspaceBranding> = {
      logoUrl: logoUrl || branding.logoUrl || null,
      accentColor: colorTokens.accent ?? branding.accentColor ?? '#195C4A',
      primaryColor: colorTokens.primary ?? branding.primaryColor ?? undefined,
      secondaryColor: colorTokens.secondary ?? branding.secondaryColor ?? undefined,
      domainPrefix: domainPrefix || branding.domainPrefix || null,
      headerText: headerText || branding.headerText || null,
      footerText: footerText || branding.footerText || null,
      customCss: customCss || branding.customCss || null,
    }
    try {
      await updateMutation.mutateAsync(payload)
      setTokens(workspaceBrandingToTokens(payload))
      toast.success('Branding saved')
    } catch {
      toast.error('Failed to save branding')
    }
  }, [
    logoUrl,
    colorTokens,
    domainPrefix,
    headerText,
    footerText,
    customCss,
    branding,
    updateMutation,
    setTokens,
  ])

  const handleLogoChange = (url: string) => {
    setLogoUrl(url)
  }

  const handleLogoUpload = async (file: File): Promise<string> => {
    try {
      const { url } = await brandingApi.uploadAsset('logo', file)
      return url
    } catch {
      const objectUrl = URL.createObjectURL(file)
      toast.info('Using local preview — configure Supabase for persistent storage')
      return objectUrl
    }
  }

  const handleExportCss = () => {
    const css = `:root {
  --primary: ${colorTokens.primary ?? '#195C4A'};
  --accent: ${colorTokens.accent ?? '#7BE495'};
  --secondary: ${colorTokens.secondary ?? '#7BE495'};
}`
    const blob = new Blob([css], { type: 'text/css' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'branding-tokens.css'
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('CSS exported')
  }

  const handleExportJson = () => {
    const json = JSON.stringify({ colorTokens }, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'branding-tokens.json'
    a.click()
    URL.revokeObjectURL(a.href)
    toast.success('JSON exported')
  }

  const handleDomainConfigChange = (config: { domain?: string | null; prefix?: string | null }) => {
    if (config.prefix !== undefined) setDomainPrefix(config.prefix ?? '')
    // Domain (custom CNAME) would be persisted via branding API when integrated
  }

  if (isLoading) return null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Branding</h1>
        <p className="mt-1 text-muted-foreground">
          Logo, colors, domain, and client portal URL
        </p>
      </div>

      <Tabs defaultValue="studio" className="space-y-6">
        <TabsList className="rounded-full bg-secondary/50 p-1">
          <TabsTrigger value="studio" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Branding Studio
          </TabsTrigger>
          <TabsTrigger value="quick" className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Quick edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="studio" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <AssetUploader
                assetType="logo"
                value={logoUrl || branding.logoUrl}
                onChange={handleLogoChange}
                onUpload={handleLogoUpload}
              />
              <ColorTokenEditor
                tokens={colorTokens}
                onChange={setColorTokens}
                onExportCss={handleExportCss}
                onExportJson={handleExportJson}
              />
              <DomainManager
                config={{
                  prefix: domainPrefix || branding.domainPrefix,
                  domain: (branding as { domain?: string }).domain ?? null,
                  tlsStatus: ((branding as { domainConfig?: { tlsStatus?: string } }).domainConfig?.tlsStatus ?? 'pending') as 'pending' | 'active' | 'provisioning' | 'expired' | 'error',
                }}
                onConfigChange={handleDomainConfigChange}
                clientPortalBaseUrl="https://clients.archject.app"
              />
              <div className="space-y-2">
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  placeholder=".client-portal { font-family: sans-serif; }"
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Optional CSS for client-facing decision logs. Use with caution.
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="rounded-full transition-all duration-200 hover:scale-[1.02]"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save branding'}
              </Button>
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-6">
                <PreviewPane tokens={previewTokens} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quick" className="mt-0">
          <BrandingCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
