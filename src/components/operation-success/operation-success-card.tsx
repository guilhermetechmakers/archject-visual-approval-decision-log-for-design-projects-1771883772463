/**
 * Operation Success Card - core content for success state
 * Renders icon, title, message, summary, CTAs, and optional export options
 */

import { useEffect, useRef, useState } from 'react'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ExportButtonGroup } from './export-button-group'
import { cn } from '@/lib/utils'
import type {
  OperationSuccessProps,
  SuccessAction,
  SuccessSummaryItem,
} from '@/types/operation-success'

export interface OperationSuccessCardProps extends OperationSuccessProps {
  /** Optional close handler for X button - when provided with showClose, renders close button */
  onClose?: () => void
  showClose?: boolean
}

export function OperationSuccessCard({
  title,
  message,
  summary = [],
  actions = [],
  exportOptions = [],
  isExporting = false,
  exportingFormat = null,
  autoDismissMs,
  showClose = true,
  onClose,
  tip,
  asPage = false,
}: OperationSuccessCardProps) {
  const [countdown, setCountdown] = useState<number | null>(
    autoDismissMs ? Math.ceil(autoDismissMs / 1000) : null
  )
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!autoDismissMs || !onClose) return
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [autoDismissMs, onClose])

  const renderAction = (action: SuccessAction) => {
    const Icon = action.icon
    const variant =
      action.variant === 'primary'
        ? 'default'
        : action.variant === 'secondary'
          ? 'secondary'
          : action.variant ?? 'outline'

    return (
      <Button
        key={action.label}
        variant={variant}
        size="default"
        onClick={action.onClick}
        className={cn(
          'transition-all duration-200 hover:scale-[1.02] hover:shadow-md',
          action.variant === 'primary' && 'bg-primary text-primary-foreground'
        )}
        style={action.variant === 'primary' ? { backgroundColor: 'rgb(var(--primary))' } : undefined}
        aria-label={action.label}
      >
        {Icon && <Icon className="h-4 w-4" />}
        {action.label}
      </Button>
    )
  }

  return (
    <Card
      className={cn(
        'rounded-2xl border border-border bg-card shadow-card transition-all duration-200',
        asPage && 'max-w-lg mx-auto'
      )}
      role="status"
      aria-live="polite"
      aria-label={`Success: ${title}`}
    >
      <CardHeader className="pb-4">
        <div className="relative flex flex-col items-center text-center">
          {showClose && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 top-0 rounded-lg p-2 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
            <Check className="h-8 w-8 text-success" aria-hidden />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground md:text-2xl">{title}</h2>
          <p className="mt-2 text-muted-foreground">{message}</p>
          {countdown !== null && countdown > 0 && (
            <p
              className="mt-2 text-sm text-muted-foreground"
              role="timer"
              aria-live="off"
            >
              Closing in {countdown}s
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {summary.length > 0 && (
          <div
            className="grid gap-3 rounded-xl border border-border bg-muted/30 p-4"
            role="list"
          >
            {summary.map((item: SuccessSummaryItem) => (
              <div
                key={item.label}
                className="flex justify-between gap-4 text-sm"
                role="listitem"
              >
                <span className="font-medium text-muted-foreground">{item.label}</span>
                <span className="text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {exportOptions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Download export</p>
            <ExportButtonGroup
              formats={exportOptions.map((o) => o.type)}
              onExport={(format) => {
                const opt = exportOptions.find((o) => o.type === format)
                void opt?.action()
              }}
              loadingFormat={exportingFormat}
              disabled={isExporting}
            />
          </div>
        )}

        {tip && (
          <p className="text-sm text-muted-foreground">{tip}</p>
        )}

        <div className="flex flex-wrap gap-3 justify-center sm:justify-end">
          {actions.map(renderAction)}
          {showClose && onClose && actions.length === 0 && (
            <Button
              variant="default"
              onClick={onClose}
              className="bg-primary text-primary-foreground"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
            >
              Close
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
