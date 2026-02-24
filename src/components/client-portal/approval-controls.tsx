/**
 * ApprovalControls - Approve button, Request Changes button,
 * with status chips and audit-friendly labels.
 * Design: Pill-shaped buttons, primary in deep green (#195C4A).
 */

import { Check, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type ApprovalStatus = 'pending' | 'approved' | 'changes_requested'

export interface ApprovalControlsProps {
  status?: ApprovalStatus
  selectedOptionId: string | null
  clientName: string
  onClientNameChange: (name: string) => void
  onApprove: () => void
  onRequestChanges: () => void
  isApproving?: boolean
  isRequestingChanges?: boolean
  requiresOtp?: boolean
  onOtpRequiredClick?: () => void
  accentColor?: string
  className?: string
}

export function ApprovalControls({
  status = 'pending',
  selectedOptionId,
  clientName,
  onClientNameChange,
  onApprove,
  onRequestChanges,
  isApproving = false,
  isRequestingChanges = false,
  requiresOtp = false,
  onOtpRequiredClick,
  accentColor = 'rgb(var(--primary))',
  className,
}: ApprovalControlsProps) {
  const isDisabled = status !== 'pending'
  const canApprove = !isDisabled && !!selectedOptionId

  return (
    <div
      className={cn(
        'space-y-4 rounded-xl border border-border bg-card p-6 shadow-card',
        className
      )}
    >
      <div className="space-y-2">
        <Label
          htmlFor="client-name-approval"
          className="text-sm font-medium text-foreground"
        >
          Your name (optional, for the approval record)
        </Label>
        <Input
          id="client-name-approval"
          type="text"
          placeholder="John Smith"
          value={clientName}
          onChange={(e) => onClientNameChange(e.target.value)}
          className="max-w-xs rounded-lg bg-[rgb(var(--input))] focus:ring-2 focus:ring-ring"
          disabled={isDisabled}
        />
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          onClick={onRequestChanges}
          disabled={isDisabled || isRequestingChanges}
          className="rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          {isRequestingChanges ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          Request changes
        </Button>
        <Button
          disabled={!canApprove || isApproving}
          onClick={() => {
            if (requiresOtp && onOtpRequiredClick) {
              onOtpRequiredClick()
            } else {
              onApprove()
            }
          }}
          className={cn(
            'rounded-full transition-all duration-200 hover:scale-[1.02] hover:shadow-md'
          )}
          style={{ backgroundColor: canApprove ? accentColor : undefined }}
        >
          {isApproving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4" />
          )}
          Approve selection
        </Button>
      </div>
    </div>
  )
}
