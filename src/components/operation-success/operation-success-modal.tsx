/**
 * Operation Success Modal - Dialog wrapper for success state
 * Uses Radix Dialog with focus trap and Esc to close
 * Supports legacy type-based API for backward compatibility
 */

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { OperationSuccessCard } from './operation-success-card'
import type { OperationSuccessProps } from '@/types/operation-success'

export type SuccessType =
  | 'share_link_created'
  | 'export_generated'
  | 'approval_recorded'
  | 'changes_requested'
  | 'payment_completed'
  | 'invoice_created'
  | 'generic'

const DEFAULT_TITLES: Record<SuccessType, string> = {
  share_link_created: 'Share link created',
  export_generated: 'Export generated',
  approval_recorded: 'Approval recorded',
  changes_requested: 'Changes requested',
  payment_completed: 'Payment successful',
  invoice_created: 'Invoice created',
  generic: 'Success',
}

const DEFAULT_DESCRIPTIONS: Record<SuccessType, string> = {
  share_link_created:
    'Your secure client portal link has been created. Share it with your client to get their feedback.',
  export_generated:
    'Your decision export has been generated. You can download it from your device.',
  approval_recorded:
    'Thank you for your decision. The studio has been notified and will proceed accordingly.',
  changes_requested:
    'Your feedback has been recorded. The studio will review and get back to you.',
  payment_completed:
    'Your payment has been processed. Your subscription is now active.',
  invoice_created:
    'Your invoice has been created and will be sent to your email. Your subscription will activate once payment is received.',
  generic: 'Operation completed successfully.',
}

export interface OperationSuccessModalProps extends Partial<OperationSuccessProps> {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Legacy: preset type for default title/description */
  type?: SuccessType
  /** Legacy: alias for message */
  description?: string
  /** Legacy: shown as tip */
  nextSteps?: string
  /** Legacy: accent color for success icon */
  accentColor?: string
}

export function OperationSuccessModal({
  open,
  onOpenChange,
  type = 'generic',
  title: titleProp,
  message: messageProp,
  description,
  summary,
  actions,
  exportOptions,
  isExporting,
  exportingFormat,
  autoDismissMs,
  showClose = true,
  onClose,
  tip,
  nextSteps,
  accentColor: _accentColor,
}: OperationSuccessModalProps) {
  const title = titleProp ?? DEFAULT_TITLES[type]
  const message = messageProp ?? description ?? DEFAULT_DESCRIPTIONS[type]
  const tipResolved = tip ?? nextSteps
  const handleClose = () => {
    onClose?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) onClose?.(); }}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden border-0"
        showClose={false}
        aria-describedby="operation-success-description"
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div id="operation-success-description" className="sr-only">
          {message}
        </div>
        <OperationSuccessCard
          title={title}
          message={message}
          summary={summary}
          actions={actions}
          exportOptions={exportOptions}
          isExporting={isExporting}
          exportingFormat={exportingFormat}
          autoDismissMs={autoDismissMs}
          showClose={showClose}
          onClose={handleClose}
          tip={tipResolved}
          asPage={false}
        />
      </DialogContent>
    </Dialog>
  )
}
