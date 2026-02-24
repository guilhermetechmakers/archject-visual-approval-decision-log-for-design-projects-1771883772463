/**
 * Dashboard filters - date range, project status for dashboard view
 */

import { Calendar, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export interface DashboardFilters {
  from: string
  to: string
  projectStatus?: 'active' | 'all'
}

const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
] as const

function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export interface DashboardFiltersBarProps {
  filters: DashboardFilters
  onFiltersChange: (f: DashboardFilters) => void
  className?: string
}

export function DashboardFiltersBar({
  filters,
  onFiltersChange,
  className,
}: DashboardFiltersBarProps) {
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
      const start = new Date(filters.to)
      start.setDate(start.getDate() - p.days)
      return filters.from === formatDateForInput(start)
    })?.label ?? 'Custom'

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
        <Label htmlFor="dashboard-from" className="sr-only">
          Start date
        </Label>
        <Input
          id="dashboard-from"
          type="date"
          value={filters.from}
          onChange={(e) => onFiltersChange({ ...filters, from: e.target.value })}
          className="w-[140px] rounded-lg bg-input"
          max={filters.to}
          aria-label="Start date"
        />
        <span className="text-muted-foreground">–</span>
        <Label htmlFor="dashboard-to" className="sr-only">
          End date
        </Label>
        <Input
          id="dashboard-to"
          type="date"
          value={filters.to}
          onChange={(e) => onFiltersChange({ ...filters, to: e.target.value })}
          className="w-[140px] rounded-lg bg-input"
          min={filters.from}
          aria-label="End date"
        />
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
        <Select
          value={filters.projectStatus ?? 'active'}
          onValueChange={(v) =>
            onFiltersChange({ ...filters, projectStatus: v as 'active' | 'all' })
          }
        >
          <SelectTrigger className="w-[130px] rounded-lg" aria-label="Project status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active only</SelectItem>
            <SelectItem value="all">All projects</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
