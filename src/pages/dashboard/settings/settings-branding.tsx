/**
 * Settings Branding - Full Branding Studio
 * Asset upload, color tokens, domain/URL, live preview, validation
 */

import { useState, useEffect, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
import {
  DEFAULT_PRIMARY_HEX,
  DEFAULT_ACCENT_HEX,
  DEFAULT_SECONDARY_HEX,
} from '@/lib/design-tokens'
import { toast } from 'sonner'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { WorkspaceBranding } from '@/types/settings'
import type { ColorTokens } from '@/types/branding'

function BrandingSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in" role="status" aria-label="Loading branding settings">
      <div>
        <Skeleton className="h-8 w-48" aria-hidden />
        <Skeleton className="mt-2 h-5 w-72" aria-hidden />
      </div>
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-pill" aria-hidden />
          <Skeleton className="h-10 w-24 rounded-pill" aria-hidden />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-32 w-full rounded-xl" aria-hidden />
            <Skeleton className="h-64 w-full rounded-xl" aria-hidden />
            <Skeleton className="h-48 w-full rounded-xl" aria-hidden />
            <Skeleton className="h-24 w-full rounded-lg" aria-hidden />
            <Skeleton className="h-10 w-32 rounded-pill" aria-hidden />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="h-64 w-full rounded-xl" aria-hidden />
          </div>
        </div>
      </div>
    </div>
  )
}

export function SettingsBranding() {
  const { data: workspace, isLoading, isError, refetch } = useSettingsWorkspace()
  const updateMutation = useUpdateWorkspaceBranding()
  const { setTokens } = useBranding()

  const branding: Partial<WorkspaceBranding> = workspace?.branding ?? {}

  const [logoUrl, setLogoUrl] = useState(branding.logoUrl ?? '')
  const [colorTokens, setColorTokens] = useState<Partial<ColorTokens>>({
    primary: branding.primaryColor ?? branding.accentColor ?? DEFAULT_PRIMARY_HEX,
    accent: branding.accentColor ?? DEFAULT_ACCENT_HEX,
    secondary: branding.secondaryColor ?? DEFAULT_SECONDARY_HEX,
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
          primary: b.primaryColor ?? b.accentColor ?? DEFAULT_PRIMARY_HEX,
          accent: b.accentColor ?? DEFAULT_ACCENT_HEX,
          secondary: b.secondaryColor ?? DEFAULT_SECONDARY_HEX,
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
      accentColor: colorTokens.accent ?? branding.accentColor ?? DEFAULT_PRIMARY_HEX,
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
  --primary: ${colorTokens.primary ?? DEFAULT_PRIMARY_HEX};
  --accent: ${colorTokens.accent ?? DEFAULT_ACCENT_HEX};
  --secondary: ${colorTokens.secondary ?? DEFAULT_SECONDARY_HEX};
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

  if (isLoading) return <BrandingSkeleton />

  if (isError) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Branding</h1>
          <p className="mt-1 text-muted-foreground">
            Logo, colors, domain, and client portal URL
          </p>
        </div>
        <div
          className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-muted/30 px-6 py-12 text-center"
          role="alert"
        >
          <AlertCircle className="h-12 w-12 text-destructive" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Failed to load branding settings</p>
            <p className="text-sm text-muted-foreground">
              Could not load your workspace branding. Please try again.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-pill"
            aria-label="Retry loading branding settings"
          >
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const saveError = updateMutation.isError
    ? (updateMutation.error as Error)?.message ?? 'Failed to save branding'
    : null

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Branding</h1>
        <p className="mt-1 text-muted-foreground">
          Logo, colors, domain, and client portal URL
        </p>
      </div>

      <Tabs defaultValue="studio" className="space-y-6">
        <TabsList
          className="rounded-full bg-secondary/50 p-1"
          role="tablist"
          aria-label="Branding configuration tabs"
        >
          <TabsTrigger
            value="studio"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="Branding Studio tab - full branding editor"
          >
            Branding Studio
          </TabsTrigger>
          <TabsTrigger
            value="quick"
            className="rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="Quick edit tab - simplified branding"
          >
            Quick edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="studio" className="mt-0 space-y-6">
          {saveError && (
            <div
              className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3"
              role="alert"
            >
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-destructive">Save failed</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{saveError}</p>
              </div>
            </div>
          )}
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
                  aria-label="Custom CSS for client-facing decision logs"
                  aria-describedby="custom-css-hint"
                />
                <p id="custom-css-hint" className="text-xs text-muted-foreground">
                  Optional CSS for client-facing decision logs. Use with caution.
                </p>
              </div>
              <Button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="rounded-full transition-all duration-200 hover:scale-[1.02]"
                aria-label={updateMutation.isPending ? 'Saving branding' : 'Save branding'}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                    Saving...
                  </>
                ) : (
                  'Save branding'
                )}
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
