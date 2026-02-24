import { Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type SuccessType =
  | 'share_link_created'
  | 'export_generated'
  | 'approval_recorded'
  | 'changes_requested'
  | 'payment_completed'
  | 'invoice_created'
  | 'generic'

export interface OperationSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type?: SuccessType
  title?: string
  description?: string
  nextSteps?: string
  onClose?: () => void
  accentColor?: string
  className?: string
}

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

export function OperationSuccessModal({
  open,
  onOpenChange,
  type = 'generic',
  title,
  description,
  nextSteps,
  onClose,
  accentColor = 'rgb(var(--primary))',
  className,
}: OperationSuccessModalProps) {
  const handleClose = () => {
    onClose?.()
    onOpenChange(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClose?.()
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn('max-w-md text-center', className)}
        aria-describedby="success-description"
      >
        <DialogHeader>
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Check
              className="h-8 w-8"
              style={{ color: accentColor }}
            />
          </div>
          <DialogTitle className="pt-4">
            {title ?? DEFAULT_TITLES[type]}
          </DialogTitle>
          <DialogDescription id="success-description">
            {description ?? DEFAULT_DESCRIPTIONS[type]}
          </DialogDescription>
        </DialogHeader>
        {nextSteps && (
          <p className="text-sm text-muted-foreground">{nextSteps}</p>
        )}
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleClose} style={{ backgroundColor: accentColor }}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
