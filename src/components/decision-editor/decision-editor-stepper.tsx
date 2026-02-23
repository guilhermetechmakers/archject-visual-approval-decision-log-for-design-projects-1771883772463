import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DecisionEditorStep } from '@/types/decision-editor'
import { EDITOR_STEPS } from '@/types/decision-editor'

export interface DecisionEditorStepperProps {
  currentStep: DecisionEditorStep
  onStepClick?: (step: DecisionEditorStep) => void
  canGoToStep?: (step: DecisionEditorStep) => boolean
}

export function DecisionEditorStepper({
  currentStep,
  onStepClick,
  canGoToStep = () => true,
}: DecisionEditorStepperProps) {
  const currentIndex = EDITOR_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav
      aria-label="Decision creation progress"
      className="sticky top-6 shrink-0 w-56"
    >
      <ol className="space-y-0">
        {EDITOR_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = step.id === currentStep
          const canNavigate = canGoToStep(step.id)
          const isClickable = onStepClick && (canNavigate || isCompleted)

          return (
            <li
              key={step.id}
              className={cn(
                'group relative flex items-start gap-3',
                index < EDITOR_STEPS.length - 1 && 'pb-6'
              )}
            >
              {index < EDITOR_STEPS.length - 1 && (
                <div
                  aria-hidden
                  className={cn(
                    'absolute left-[11px] top-6 w-0.5 -translate-x-px',
                    isCompleted ? 'bg-primary' : 'bg-border'
                  )}
                  style={{ height: 'calc(100% - 8px)' }}
                />
              )}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-1 items-start gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg -ml-1 pl-1',
                  isClickable && 'cursor-pointer',
                  !isClickable && 'cursor-default'
                )}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`${step.label}${isCompleted ? ' (completed)' : ''}`}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent &&
                      !isCompleted &&
                      'border-primary bg-background text-primary',
                    !isCurrent &&
                      !isCompleted &&
                      'border-border bg-background text-muted-foreground',
                    isClickable && 'group-hover:border-primary/80'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </span>
                <span
                  className={cn(
                    'block pt-0.5 text-sm font-medium',
                    isCurrent ? 'text-foreground' : 'text-muted-foreground',
                    isClickable && 'group-hover:text-foreground'
                  )}
                >
                  {step.label}
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
