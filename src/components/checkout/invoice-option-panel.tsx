import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface InvoiceOptionPanelProps {
  selected: boolean
  onSelect: () => void
  disabled?: boolean
  className?: string
}

export function InvoiceOptionPanel({
  selected,
  onSelect,
  disabled = false,
  className,
}: InvoiceOptionPanelProps) {
  return (
    <Card
      className={cn(
        'rounded-2xl border-2 transition-all duration-200 cursor-pointer',
        selected
          ? 'border-primary bg-primary/5 shadow-card'
          : 'border-border bg-card hover:border-primary/50 hover:shadow-card-hover',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className
      )}
      onClick={() => !disabled && onSelect()}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-pressed={selected}
      aria-label="Request invoice instead of card payment"
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
              selected ? 'bg-primary/20' : 'bg-secondary'
            )}
          >
            <FileText className={cn('h-5 w-5', selected ? 'text-primary' : 'text-muted-foreground')} />
          </div>
          <CardTitle className="text-base">Request invoice</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Pay by invoice instead of card. We'll generate an invoice and send it to your billing email.
          Payment terms apply.
        </p>
      </CardContent>
    </Card>
  )
}
