import { cn } from '@/lib/utils'
import type { TransactionStatus } from '@/types/billing-history'

const STATUS_STYLES: Record<
  TransactionStatus,
  string
> = {
  paid: 'bg-success/20 text-primary border-success/30',
  pending: 'bg-warning/50 text-foreground border-warning-muted/50',
  due: 'bg-warning/50 text-foreground border-warning-muted/50',
  overdue: 'bg-destructive/20 text-destructive border-destructive/30',
  failed: 'bg-destructive/20 text-destructive border-destructive/30',
  refunded: 'bg-primary/10 text-primary border-primary/20',
}

interface StatusBadgeProps {
  status: TransactionStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status] ?? 'bg-secondary text-muted-foreground border-border',
        className
      )}
    >
      {status}
    </span>
  )
}
