/**
 * Branding API - assets, tokens, domain, validation
 */

import { api } from '@/lib/api'
import { getAccessTokenSync } from '@/lib/auth-service'
import type {
  WorkspaceBranding,
  DomainConfig,
  BrandingValidation,
} from '@/types/settings'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export const brandingApi = {
  /** Get current workspace branding tokens */
  getBranding: () => api.get<WorkspaceBranding>('/branding'),

  /** Update branding tokens (colors, logo, typography) */
  updateBranding: (data: Partial<WorkspaceBranding>) =>
    api.put<WorkspaceBranding>('/branding', data),

  /** Upload branding asset (logo, favicon) - uses FormData */
  uploadAsset: async (assetType: 'logo' | 'favicon', file: File): Promise<{ url: string }> => {
    const formData = new FormData()
    formData.append('assetType', assetType)
    formData.append('file', file)
    const token = getAccessTokenSync()
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(`${API_BASE}/branding/assets`, {
      method: 'POST',
      body: formData,
      headers,
      credentials: 'include',
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error((err as { message?: string }).message ?? res.statusText)
    }
    return res.json()
  },

  /** Generate preview payload for live WYSIWYG */
  previewBranding: (data: Partial<WorkspaceBranding>) =>
    api.post<WorkspaceBranding>('/branding/preview', data),

  /** Validate branding (contrast, logo size, accessibility) */
  validateBranding: (data: Partial<WorkspaceBranding>) =>
    api.post<BrandingValidation>('/branding/validate', data),

  /** Configure custom domain/prefix */
  updateDomain: (data: Partial<DomainConfig>) =>
    api.post<DomainConfig>('/branding/domain', data),

  /** Get domain/TLS status */
  getDomainStatus: () => api.get<DomainConfig>('/branding/domain-status'),
}
