import { Tag, Check, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CouponStatus = 'idle' | 'valid' | 'invalid' | 'loading'

interface CouponCodeFieldProps {
  value: string
  onChange: (value: string) => void
  onApply: () => void
  status: CouponStatus
  appliedCode?: string
  discountAmount?: number
  message?: string
  onRemove?: () => void
  disabled?: boolean
  className?: string
}

export function CouponCodeField({
  value,
  onChange,
  onApply,
  status,
  appliedCode,
  discountAmount,
  message,
  onRemove,
  disabled,
  className,
}: CouponCodeFieldProps) {
  const hasApplied = status === 'valid' && appliedCode

  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor="coupon" className="text-sm font-medium text-foreground">
        Promo code
      </label>
      {hasApplied ? (
        <div
          className="flex items-center justify-between rounded-lg border border-success/50 bg-success/10 px-4 py-3"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-success" />
            <span className="font-medium text-success">{appliedCode}</span>
            {discountAmount != null && (
              <span className="text-sm text-muted-foreground">
                −{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(discountAmount)}
              </span>
            )}
          </div>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              aria-label="Remove coupon"
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="coupon"
              placeholder="Enter code"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onApply())}
              className={cn(
                'pl-9',
                status === 'invalid' && 'border-destructive focus-visible:ring-destructive'
              )}
              disabled={disabled}
              aria-invalid={status === 'invalid'}
              aria-describedby={status === 'invalid' ? 'coupon-error' : undefined}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onApply}
            disabled={!value.trim() || status === 'loading' || disabled}
            aria-label="Apply coupon"
          >
            {status === 'loading' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Apply'
            )}
          </Button>
        </div>
      )}
      {status === 'invalid' && (
        <p id="coupon-error" className="text-sm text-destructive" role="alert">
          {message ?? 'Invalid or expired coupon code. Please try again.'}
        </p>
      )}
    </div>
  )
}
