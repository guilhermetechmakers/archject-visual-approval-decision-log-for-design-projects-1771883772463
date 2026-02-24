/**
 * LoadingOverlay - Full-screen overlay for critical async operations.
 *
 * Renders a dimmed backdrop with centered spinner and optional progress.
 * Prevents interaction with underlying UI when open.
 * Accessible: aria-live="polite" for progress text, focus trap when open.
 *
 * @example
 * <LoadingOverlay isOpen={isLoading} title="Loading..." progress={45} />
 * <LoadingOverlay isOpen={appLoading} blurBackground />
 * <LoadingOverlay isOpen={loading} dismissible onDismiss={() => setLoading(false)} />
 */

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isOpen: boolean
  /** Optional title shown above the spinner */
  title?: string
  /** Optional progress 0-100 for progress indicator */
  progress?: number
  /** Whether to blur the background. Default: true */
  blurBackground?: boolean
  /** When true, Esc key closes the overlay and calls onDismiss */
  dismissible?: boolean
  /** Called when user presses Esc (only when dismissible) */
  onDismiss?: () => void
  /** Optional className for the overlay container */
  className?: string
}

export function LoadingOverlay({
  isOpen,
  title,
  progress,
  blurBackground = true,
  dismissible = false,
  onDismiss,
  className,
}: LoadingOverlayProps) {
  const progressRef = React.useRef<HTMLDivElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!isOpen || !dismissible) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onDismiss?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, dismissible, onDismiss])

  React.useEffect(() => {
    if (!isOpen) return
    const prev = document.activeElement as HTMLElement | null
    containerRef.current?.focus()
    return () => {
      prev?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center',
        blurBackground && 'backdrop-blur-sm',
        'bg-background/80',
        'pointer-events-auto',
        'outline-none',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={title ?? 'Loading'}
    >
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-8 shadow-card">
        <Loader2
          className="h-12 w-12 animate-spin text-primary"
          aria-hidden
        />
        {title && (
          <p className="text-base font-medium text-foreground">{title}</p>
        )}
        {progress !== undefined && progress >= 0 && progress <= 100 && (
          <div className="w-48 space-y-2" ref={progressRef}>
            <Progress value={progress} className="h-2" />
            <p
              className="text-center text-sm text-muted-foreground"
              aria-live="polite"
            >
              {Math.round(progress)}%
            </p>
          </div>
        )}
        {dismissible && (
          <p className="text-xs text-muted-foreground">Press Esc to cancel</p>
        )}
      </div>
    </div>
  )
}
