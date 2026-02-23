/**
 * Analytics filters - date range, group-by, presets
 */

import { Calendar, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import type { AnalyticsFilters, GroupByOption } from '@/types/analytics'
import { cn } from '@/lib/utils'

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
] as const

const GROUP_BY_OPTIONS: { value: GroupByOption; label: string }[] = [
  { value: 'PROJECT', label: 'Project' },
  { value: 'CLIENT', label: 'Client' },
  { value: 'TEMPLATE', label: 'Template' },
]

function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export interface AnalyticsFiltersBarProps {
  filters: AnalyticsFilters
  onFiltersChange: (f: AnalyticsFilters) => void
  className?: string
}

export function AnalyticsFiltersBar({
  filters,
  onFiltersChange,
  className,
}: AnalyticsFiltersBarProps) {
  const handlePreset = (preset: (typeof DATE_PRESETS)[number]) => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(start.getDate() - preset.days)
    onFiltersChange({
      ...filters,
      from: formatDateForInput(start),
      to: formatDateForInput(now),
    })
  }

  const currentPreset =
    DATE_PRESETS.find((p) => {
      if ('days' in p) {
        const start = new Date(filters.to)
        start.setDate(start.getDate() - p.days)
        return filters.from === formatDateForInput(start)
      }
      return false
    })?.label ?? 'Custom'

  const toggleGroupBy = (opt: GroupByOption, checked: boolean) => {
    const current = filters.groupBy ?? []
    const next = checked
      ? [...current, opt]
      : current.filter((g) => g !== opt)
    onFiltersChange({ ...filters, groupBy: next.length ? next : undefined })
  }

  const selectedGroupCount = filters.groupBy?.length ?? 0

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden />
        <Select
          value={currentPreset}
          onValueChange={(v) => {
            const preset = DATE_PRESETS.find((p) => p.label === v)
            if (preset) handlePreset(preset)
          }}
        >
          <SelectTrigger className="w-[140px] rounded-lg" aria-label="Date range preset">
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
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="analytics-from" className="sr-only">
          Start date
        </Label>
        <Input
          id="analytics-from"
          type="date"
          value={filters.from}
          onChange={(e) =>
            onFiltersChange({ ...filters, from: e.target.value })
          }
          className="w-[140px] rounded-lg"
          max={filters.to}
        />
        <span className="text-muted-foreground">–</span>
        <Label htmlFor="analytics-to" className="sr-only">
          End date
        </Label>
        <Input
          id="analytics-to"
          type="date"
          value={filters.to}
          onChange={(e) =>
            onFiltersChange({ ...filters, to: e.target.value })
          }
          className="w-[140px] rounded-lg"
          min={filters.from}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            aria-label="Group by"
          >
            <Filter className="h-4 w-4" />
            Group by
            {selectedGroupCount > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-xs">
                {selectedGroupCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 rounded-xl">
          <DropdownMenuLabel>Group by</DropdownMenuLabel>
          {GROUP_BY_OPTIONS.map((opt) => (
            <DropdownMenuCheckboxItem
              key={opt.value}
              checked={filters.groupBy?.includes(opt.value) ?? false}
              onCheckedChange={(c) => toggleGroupBy(opt.value, c === true)}
            >
              {opt.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
