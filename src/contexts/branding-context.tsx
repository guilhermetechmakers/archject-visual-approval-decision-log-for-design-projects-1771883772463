/**
 * Branding context - propagates branding tokens to client-facing views.
 * Single source of truth for theming; used by Client Portal, Project Workspace, No-Login Portal.
 */

import * as React from 'react'
import { useSettingsWorkspace } from '@/hooks/use-settings'
import type { WorkspaceBranding } from '@/types/settings'

export interface BrandingContextValue {
  branding: WorkspaceBranding | null
  accentColor: string
  logoUrl: string | null
  headerText: string
  footerText: string
  clientPortalUrl: string
  isLoading: boolean
}

const defaultBranding: WorkspaceBranding = {
  accentColor: '#195C4A',
  primaryColor: '#195C4A',
  secondaryColor: '#7BE495',
  headerText: 'Design Approval Portal',
  footerText: 'Powered by Archject',
}

const BrandingContext = React.createContext<BrandingContextValue | null>(null)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { data: workspace, isLoading } = useSettingsWorkspace()
  const branding = workspace?.branding ?? defaultBranding

  const value: BrandingContextValue = React.useMemo(
    () => ({
      branding: branding ?? defaultBranding,
      accentColor: branding?.accentColor ?? '#195C4A',
      logoUrl: branding?.logoUrl ?? null,
      headerText: branding?.headerText ?? 'Design Approval Portal',
      footerText: branding?.footerText ?? 'Powered by Archject',
      clientPortalUrl:
        branding?.clientPortalUrl ??
        `https://clients.archject.app/${branding?.domainPrefix ?? 'your-studio'}`,
      isLoading,
    }),
    [branding, isLoading]
  )

  return (
    <BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
  )
}

export function useBranding(): BrandingContextValue {
  const ctx = React.useContext(BrandingContext)
  if (!ctx) {
    return {
      branding: defaultBranding,
      accentColor: '#195C4A',
      logoUrl: null,
      headerText: 'Design Approval Portal',
      footerText: 'Powered by Archject',
      clientPortalUrl: 'https://clients.archject.app/your-studio',
      isLoading: false,
    }
  }
  return ctx
}
