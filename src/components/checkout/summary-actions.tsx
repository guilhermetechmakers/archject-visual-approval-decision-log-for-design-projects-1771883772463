import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SummaryActionsProps {
  primaryLabel: string
  onPrimary?: () => void
  onPrimaryClick?: () => void
  primaryLoading?: boolean
  primaryDisabled?: boolean
  secondaryLabel?: string
  onSecondaryClick?: () => void
  secondaryDisabled?: boolean
  paymentMethod?: 'card' | 'invoice'
  className?: string
}

export function SummaryActions({
  primaryLabel,
  onPrimary,
  onPrimaryClick,
  primaryLoading = false,
  primaryDisabled = false,
  secondaryLabel = 'Request Invoice',
  onSecondaryClick,
  secondaryDisabled = false,
  paymentMethod: _paymentMethod,
  className,
}: SummaryActionsProps) {
  const handlePrimary = onPrimary ?? onPrimaryClick
  return (
    <div
      className={cn('flex flex-col gap-3', className)}
      role="group"
      aria-label="Checkout actions"
    >
      <Button
        type="button"
        onClick={handlePrimary}
        disabled={primaryDisabled || primaryLoading}
        className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
        aria-busy={primaryLoading}
        aria-live="polite"
      >
        {primaryLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          primaryLabel
        )}
      </Button>
      {onSecondaryClick && (
        <Button
          type="button"
          variant="outline"
          onClick={onSecondaryClick}
          disabled={secondaryDisabled || primaryLoading}
          className="w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {secondaryLabel}
        </Button>
      )}
    </div>
  )
}
