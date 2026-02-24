/**
 * Forge Viewer - Autodesk Forge BIM/CAD preview integration point
 * Renders BIM/CAD assets (IFC, RVT, DWG) when Forge URN and token are available.
 * Integration: Call POST /forge/token to get token, pass urn from asset.forgeAssetId
 * Requires Autodesk Forge SDK - add script or use @types/forge-viewer when integrating
 */

import { Box } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ForgeViewerProps {
  urn?: string | null
  token?: string | null
  className?: string
  minHeight?: number
  onReady?: () => void
  onError?: (err: Error) => void
}

export function ForgeViewer({
  urn,
  token,
  className,
  minHeight = 400,
}: ForgeViewerProps) {
  const hasCredentials = Boolean(urn && token)

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-secondary/30 p-8 text-center text-muted-foreground',
        className
      )}
      style={{ minHeight }}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <Box className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {hasCredentials ? 'BIM/CAD preview' : 'BIM/CAD asset'}
        </p>
        <p className="text-xs">
          {hasCredentials
            ? 'Forge Viewer integration: Load Autodesk Viewing SDK and initialize with URN + token.'
            : 'Upload IFC, RVT, or DWG and configure Forge to enable in-browser model viewing.'}
        </p>
      </div>
      {hasCredentials && (
        <p className="text-xs text-primary">
          URN: {String(urn).slice(0, 24)}...
        </p>
      )}
    </div>
  )
}
