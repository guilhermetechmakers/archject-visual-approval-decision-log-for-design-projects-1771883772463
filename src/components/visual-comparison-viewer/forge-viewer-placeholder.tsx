/**
 * Forge Viewer Placeholder - BIM/CAD preview integration
 * Placeholder for Autodesk Forge Viewer (IFC, RVT, DWG).
 * Requires: Forge API credentials, token endpoint, and URN for the model.
 * To implement: load @autodesk/viewer, initialize with token from POST /forge/token
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ForgeViewerPlaceholderProps {
  /** Forge model URN (from Model Derivative API) */
  urn?: string | null
  /** Optional token - when not provided, fetch from POST /forge/token */
  token?: string | null
  className?: string
  /** Callback when viewer is ready */
  onReady?: () => void
}

export function ForgeViewerPlaceholder({
  urn,
  token,
  className,
  onReady,
}: ForgeViewerPlaceholderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const initViewer = useCallback(async () => {
    if (!urn || !containerRef.current) {
      setIsLoading(false)
      setError('No model URN provided')
      return
    }
    try {
      // TODO: Implement Forge Viewer initialization
      // 1. Dynamic import: const Autodesk = await import('@autodesk/viewer')
      // 2. Fetch token: const { access_token } = await api.post('/forge/token', { urn })
      // 3. Initialize: new Autodesk.Viewing.Private.GuiViewer3D(containerRef.current)
      // 4. viewer.start(urn, { getAccessToken: () => token })
      await new Promise((r) => setTimeout(r, 500))
      setError('Forge Viewer not configured. Add Forge API credentials and implement token endpoint.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model')
    } finally {
      setIsLoading(false)
      onReady?.()
    }
  }, [urn, token, onReady])

  useEffect(() => {
    initViewer()
  }, [initViewer])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative flex min-h-[200px] items-center justify-center rounded-lg border border-border bg-secondary/30',
        className
      )}
    >
      {isLoading && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">Loading BIM/CAD model...</span>
        </div>
      )}
      {error && !isLoading && (
        <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-muted-foreground">
          <svg
            className="h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
