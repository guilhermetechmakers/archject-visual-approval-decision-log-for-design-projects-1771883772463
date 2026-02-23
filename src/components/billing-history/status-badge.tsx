import { cn } from '@/lib/utils'
import type { HistoryItemStatus } from '@/types/billing-history'

const STATUS_STYLES: Record<
  HistoryItemStatus,
  { className: string; label: string }
> = {
  paid: {
    className: 'bg-success/20 text-primary border-success/30',
    label: 'Paid',
  },
  pending: {
    className: 'bg-warning/50 text-foreground border-warning-muted/50',
    label: 'Pending',
  },
  due: {
    className: 'bg-warning/40 text-foreground border-warning-muted/50',
    label: 'Due',
  },
  overdue: {
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    label: 'Overdue',
  },
  failed: {
    className: 'bg-destructive/20 text-destructive border-destructive/30',
    label: 'Failed',
  },
  refunded: {
    className: 'bg-primary/10 text-primary border-primary/20',
    label: 'Refunded',
  },
}

interface StatusBadgeProps {
  status: HistoryItemStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? {
    className: 'bg-secondary text-secondary-foreground border-border',
    label: status,
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        style.className,
        className
      )}
    >
      {style.label}
    </span>
  )
}
