/**
 * StatusTag - Green/yellow/red status chips for export and decision status
 */

import { cn } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  // Export status
  queued: 'bg-muted text-muted-foreground',
  processing: 'bg-primary/20 text-primary',
  completed: 'bg-success/20 text-success',
  failed: 'bg-destructive/20 text-destructive',

  // Decision status
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-success/20 text-success',
  accepted: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive',
  needs_changes: 'bg-warning/20 text-warning',
}

export interface StatusTagProps {
  status: string
  className?: string
}

export function StatusTag({ status, className }: StatusTagProps) {
  const normalized = status.toLowerCase().replace(/\s/g, '_')
  const style = STATUS_STYLES[normalized] ?? STATUS_STYLES[status] ?? 'bg-muted text-muted-foreground'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        style,
        className
      )}
      role="status"
    >
      {status}
    </span>
  )
}
