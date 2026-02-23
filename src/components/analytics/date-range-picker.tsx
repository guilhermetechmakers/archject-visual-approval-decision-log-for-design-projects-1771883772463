/**
 * Date range picker with quick presets (Last 7/30/90 days)
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DateRange {
  from: string
  to: string
}

interface DateRangePickerProps {
  from: string
  to: string
  onChange: (range: DateRange) => void
  className?: string
}

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
] as const

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function DateRangePicker({
  from,
  to,
  onChange,
  className,
}: DateRangePickerProps) {
  const applyPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    onChange({ from: toDateStr(start), to: toDateStr(end) })
  }

  const isValid = from <= to

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.days}
            variant="secondary"
            size="sm"
            className="rounded-lg"
            onClick={() => applyPreset(p.days)}
            aria-label={`Select ${p.label}`}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="date-from" className="text-sm font-medium">
            Start date
          </Label>
          <Input
            id="date-from"
            type="date"
            value={from}
            onChange={(e) => onChange({ from: e.target.value, to })}
            className="rounded-lg bg-[#F5F6FA] border-border"
            aria-label="Start date"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date-to" className="text-sm font-medium">
            End date
          </Label>
          <Input
            id="date-to"
            type="date"
            value={to}
            onChange={(e) => onChange({ from, to: e.target.value })}
            className="rounded-lg bg-[#F5F6FA] border-border"
            aria-label="End date"
          />
        </div>
        {!isValid && (
          <p className="text-sm text-destructive" role="alert">
            Start date must be before or equal to end date
          </p>
        )}
      </div>
    </div>
  )
}
