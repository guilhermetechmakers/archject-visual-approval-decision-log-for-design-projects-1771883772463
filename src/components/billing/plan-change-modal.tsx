import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useBillingPlans, useConfirmPlanChange } from '@/hooks/use-billing'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { BillingSubscription } from '@/types/billing'

interface PlanChangeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlanId?: string
  subscription?: BillingSubscription | null
}

export function PlanChangeModal({
  open,
  onOpenChange,
  currentPlanId,
  subscription,
}: PlanChangeModalProps) {
  const navigate = useNavigate()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const { data: plans, isLoading } = useBillingPlans()
  const confirmMutation = useConfirmPlanChange()

  const currentId = currentPlanId ?? subscription?.plan?.id
  const selectedPlan = plans?.find((p) => p.id === selectedPlanId)
  const isCurrentPlan = selectedPlanId === currentId

  const handleConfirm = () => {
    if (!selectedPlanId) return
    confirmMutation.mutate(
      { plan_id: selectedPlanId, interval: 'monthly' },
      {
        onSuccess: () => {
          onOpenChange(false)
          setSelectedPlanId(null)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Change plan</DialogTitle>
          <DialogDescription>
            Select a new plan. Prorated charges will apply when upgrading mid-cycle.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-2 py-4">
            {(plans ?? []).map((plan) => {
              const isSelected = selectedPlanId === plan.id
              const isCurrent = plan.id === currentId
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border-2 px-4 py-4 text-left transition-all duration-200',
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-md'
                      : 'border-border hover:border-primary/50 hover:bg-secondary/50',
                    isCurrent && 'ring-2 ring-primary/30'
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{plan.name}</p>
                      {isCurrent && (
                        <span className="rounded-md bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {plan.currency ?? 'USD'} {plan.price}/{plan.interval === 'yearly' ? 'yr' : 'mo'}
                    </p>
                    <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                      {plan.features?.slice(0, 2).map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="shrink-0">
                    {!isCurrent && (
                      <span
                        className={cn(
                          'inline-flex h-4 w-4 shrink-0 rounded-full border-2',
                          isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                        )}
                      />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {selectedPlan && !isCurrentPlan && (
          <div className="rounded-xl border border-border bg-muted/30 p-4 animate-fade-in">
            <p className="text-sm font-medium text-foreground">Proration estimate</p>
            <p className="text-sm text-muted-foreground mt-1">
              You will be charged a prorated amount for the remainder of your billing period.
              Your next full charge will be {selectedPlan.currency ?? 'USD'} {selectedPlan.price} on
              your next billing date.
            </p>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              if (selectedPlanId && !isCurrentPlan) {
                onOpenChange(false)
                navigate(`/dashboard/checkout?plan=${selectedPlanId}`)
              }
            }}
            disabled={!selectedPlanId || isCurrentPlan}
          >
            Proceed to checkout
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPlanId || isCurrentPlan || confirmMutation.isPending}
            aria-label={confirmMutation.isPending ? 'Updating plan' : 'Confirm plan change'}
            aria-busy={confirmMutation.isPending}
          >
            {confirmMutation.isPending ? 'Updating…' : 'Confirm change'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
