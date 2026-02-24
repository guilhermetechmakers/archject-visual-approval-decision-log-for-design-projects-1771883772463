/**
 * DeepZoomViewer - OpenSeadragon-based deep-zoom image viewer
 * Supports progressive loading, pan, zoom, and annotation overlay
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import OpenSeadragon from 'openseadragon'
import { cn } from '@/lib/utils'

export interface DeepZoomViewerProps {
  imageUrl: string
  className?: string
  minHeight?: number
  onViewerReady?: (viewer: OpenSeadragon.Viewer) => void
  onViewportChange?: (center: { x: number; y: number }, zoom: number) => void
  children?: React.ReactNode
}

export function DeepZoomViewer({
  imageUrl,
  className,
  minHeight = 320,
  onViewerReady,
  onViewportChange,
  children,
}: DeepZoomViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<OpenSeadragon.Viewer | null>(null)
  const [isReady, setIsReady] = useState(false)

  const initViewer = useCallback(() => {
    if (!containerRef.current || !imageUrl) return

    if (viewerRef.current) {
      viewerRef.current.destroy()
      viewerRef.current = null
    }

    const viewer = OpenSeadragon({
      element: containerRef.current,
      prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@6/build/openseadragon/images/',
      tileSources: {
        type: 'image',
        url: imageUrl,
      },
      showNavigationControl: false,
      showNavigator: false,
      gestureSettingsMouse: {
        clickToZoom: true,
        dblClickToZoom: true,
        flickEnabled: true,
      },
      gestureSettingsTouch: {
        pinchToZoom: true,
        flickEnabled: true,
      },
      animationTime: 0.2,
      springStiffness: 10,
      visibilityRatio: 0.9,
      minZoomLevel: 0.5,
      maxZoomLevel: 10,
    })

    viewer.addHandler('open', () => {
      setIsReady(true)
      onViewerReady?.(viewer)
    })

    viewer.addHandler('animation-finish', () => {
      const vp = viewer.viewport
      const center = vp.getCenter(true)
      const zoom = vp.getZoom(true)
      onViewportChange?.({ x: center.x, y: center.y }, zoom)
    })

    viewerRef.current = viewer
  }, [imageUrl, onViewerReady, onViewportChange])

  useEffect(() => {
    initViewer()
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy()
        viewerRef.current = null
      }
      setIsReady(false)
    }
  }, [initViewer])

  return (
    <div
      className={cn('relative overflow-hidden rounded-lg bg-secondary/30', className)}
      style={{ minHeight }}
    >
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight }}
        role="img"
        aria-label="Deep zoom image viewer"
      />
      {isReady && children && (
        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto h-full w-full">{children}</div>
        </div>
      )}
    </div>
  )
}
