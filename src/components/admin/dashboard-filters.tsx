/**
 * Admin Dashboard filters - date range, region, account tier.
 * Design: pill-shaped selects, 8px spacing.
 */

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface DashboardFiltersState {
  dateRange: string
  region: string
  accountTier: string
}

const DEFAULT_FILTERS: DashboardFiltersState = {
  dateRange: '30d',
  region: 'all',
  accountTier: 'all',
}

const DATE_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
] as const

const REGIONS = [
  { value: 'all', label: 'All regions' },
  { value: 'us', label: 'US' },
  { value: 'eu', label: 'EU' },
  { value: 'apac', label: 'APAC' },
] as const

const ACCOUNT_TIERS = [
  { value: 'all', label: 'All tiers' },
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'enterprise', label: 'Enterprise' },
] as const

interface DashboardFiltersProps {
  filters?: DashboardFiltersState
  onFiltersChange?: (filters: DashboardFiltersState) => void
  className?: string
}

export function DashboardFilters({
  filters = DEFAULT_FILTERS,
  onFiltersChange,
  className,
}: DashboardFiltersProps) {
  const handleChange = React.useCallback(
    (key: keyof DashboardFiltersState, value: string) => {
      const next = { ...filters, [key]: value }
      onFiltersChange?.(next)
    },
    [filters, onFiltersChange]
  )

  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4',
        className
      )}
    >
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Date range</Label>
        <Select
          value={filters.dateRange}
          onValueChange={(v) => handleChange('dateRange', v)}
        >
          <SelectTrigger className="w-[160px] rounded-full bg-[rgb(var(--input))]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Region</Label>
        <Select value={filters.region} onValueChange={(v) => handleChange('region', v)}>
          <SelectTrigger className="w-[140px] rounded-full bg-[rgb(var(--input))]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Account tier</Label>
        <Select
          value={filters.accountTier}
          onValueChange={(v) => handleChange('accountTier', v)}
        >
          <SelectTrigger className="w-[140px] rounded-full bg-[rgb(var(--input))]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_TIERS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
