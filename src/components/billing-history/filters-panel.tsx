import { useState, useCallback } from 'react'
import { Search, Calendar, Filter, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TransactionType } from '@/types/billing-history'
import { cn } from '@/lib/utils'

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'This month', preset: 'this_month' as const },
  { label: 'All time', preset: 'all' as const },
] as const

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'invoice', label: 'Invoice' },
  { value: 'payment', label: 'Payment' },
  { value: 'refund', label: 'Refund' },
  { value: 'charge', label: 'Charge' },
  { value: 'proration', label: 'Proration' },
  { value: 'trial', label: 'Trial' },
  { value: 'renewal', label: 'Renewal' },
  { value: 'suspension', label: 'Suspension' },
  { value: 'cancellation', label: 'Cancellation' },
  { value: 'add_on', label: 'Add-on' },
  { value: 'plan_change', label: 'Plan change' },
]

export interface BillingHistoryFilters {
  start_date?: string
  end_date?: string
  types?: TransactionType[]
  query?: string
  date_preset?: string
}

interface FiltersPanelProps {
  filters: BillingHistoryFilters
  onFiltersChange: (filters: BillingHistoryFilters) => void
  onApply: () => void
  onReset: () => void
  isCollapsible?: boolean
  className?: string
}

function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function FiltersPanel({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  isCollapsible = true,
  className,
}: FiltersPanelProps) {
  const [collapsed, setCollapsed] = useState(!isCollapsible)
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), [])
  const [localQuery, setLocalQuery] = useState(filters.query ?? '')

  const handleDatePreset = useCallback(
    (preset: (typeof DATE_PRESETS)[number]) => {
      const now = new Date()
      let start_date: string | undefined
      let end_date: string | undefined

      if ('days' in preset) {
        const start = new Date(now)
        start.setDate(start.getDate() - preset.days)
        start_date = formatDateForInput(start)
        end_date = formatDateForInput(now)
      } else if (preset.preset === 'this_month') {
        start_date = formatDateForInput(new Date(now.getFullYear(), now.getMonth(), 1))
        end_date = formatDateForInput(now)
      } else {
        start_date = undefined
        end_date = undefined
      }

      onFiltersChange({
        ...filters,
        start_date,
        end_date,
        date_preset: preset.label,
      })
    },
    [filters, onFiltersChange]
  )

  const handleTypeToggle = useCallback(
    (type: TransactionType, checked: boolean) => {
      const current = filters.types ?? []
      const next = checked
        ? [...current, type]
        : current.filter((t) => t !== type)
      onFiltersChange({ ...filters, types: next.length ? next : undefined })
    },
    [filters, onFiltersChange]
  )

  const handleApply = useCallback(() => {
    onFiltersChange({ ...filters, query: localQuery.trim() || undefined })
    onApply()
  }, [filters, localQuery, onFiltersChange, onApply])

  const handleReset = useCallback(() => {
    setLocalQuery('')
    onFiltersChange({
      start_date: undefined,
      end_date: undefined,
      types: undefined,
      query: undefined,
      date_preset: undefined,
    })
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - 90)
    onFiltersChange({
      start_date: formatDateForInput(start),
      end_date: formatDateForInput(now),
      date_preset: 'Last 90 days',
    })
    onReset()
  }, [onFiltersChange, onReset])

  const selectedTypesCount = filters.types?.length ?? 0

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4 shadow-card transition-all duration-200',
        className
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              placeholder="Search by invoice or receipt ID…"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              className="pl-9 rounded-lg"
              aria-label="Search transactions by invoice or receipt ID"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={filters.date_preset ?? 'Last 90 days'}
              onValueChange={(v) => {
                const preset = DATE_PRESETS.find((p) => p.label === v)
                if (preset) handleDatePreset(preset)
              }}
            >
              <SelectTrigger className="w-[160px] rounded-lg" aria-label="Date range preset">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {DATE_PRESETS.map((p) => (
                  <SelectItem key={p.label} value={p.label}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  aria-label="Filter by type"
                >
                  <Filter className="h-4 w-4" />
                  Type
                  {selectedTypesCount > 0 && (
                    <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">
                      {selectedTypesCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl">
                <DropdownMenuLabel>Transaction types</DropdownMenuLabel>
                {TRANSACTION_TYPES.map((t) => (
                  <DropdownMenuCheckboxItem
                    key={t.value}
                    checked={filters.types?.includes(t.value) ?? false}
                    onCheckedChange={(checked) =>
                      handleTypeToggle(t.value, checked === true)
                    }
                  >
                    {t.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-lg"
              aria-label="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              aria-label="Apply filters"
            >
              Apply
            </Button>
            {isCollapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapsed}
                className="rounded-lg"
                aria-label={collapsed ? 'Expand date range' : 'Collapse date range'}
              >
                {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {!collapsed && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date ?? ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, start_date: e.target.value || undefined })
                }
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date ?? ''}
                onChange={(e) =>
                  onFiltersChange({ ...filters, end_date: e.target.value || undefined })
                }
                className="rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
