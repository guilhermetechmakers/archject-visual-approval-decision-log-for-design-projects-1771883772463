/**
 * FacetedFilterPanel - collapsible facets for Projects, Status, Type, etc.
 * Multi-select, counts, Clear all / Apply
 */

import * as React from 'react'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { FacetSection } from '@/lib/facet-utils'

export type { FacetOption, FacetSection } from '@/lib/facet-utils'

export interface FacetedFilterPanelProps {
  sections: FacetSection[]
  selected: Record<string, string[]>
  onSelectionChange: (facet: string, values: string[]) => void
  onClearAll: () => void
  className?: string
}

export function FacetedFilterPanel({
  sections,
  selected,
  onSelectionChange,
  onClearAll,
  className,
}: FacetedFilterPanelProps) {
  const hasActiveFilters = Object.values(selected).some((v) => v.length > 0)

  return (
    <aside
      className={cn('flex flex-col rounded-xl border border-border bg-card p-4 shadow-card', className)}
      role="search"
      aria-label="Search filters"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-muted-foreground hover:text-foreground"
            onClick={onClearAll}
            aria-label="Clear all filters"
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Clear all
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
        <div className="space-y-2 pr-2">
          {sections.map((section) => (
            <FacetSectionComponent
              key={section.id}
              section={section}
              selectedValues={selected[section.id] ?? []}
              onToggle={(value, checked) => {
                const current = selected[section.id] ?? []
                const next = checked
                  ? [...current, value]
                  : current.filter((v) => v !== value)
                onSelectionChange(section.id, next)
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  )
}

function FacetSectionComponent({
  section,
  selectedValues,
  onToggle,
}: {
  section: FacetSection
  selectedValues: string[]
  onToggle: (value: string, checked: boolean) => void
}) {
  const [collapsed, setCollapsed] = React.useState(section.collapsed ?? false)

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30">
      <button
        type="button"
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-muted/50 transition-colors rounded-lg"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span>{section.label}</span>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {!collapsed && (
        <div className="border-t border-border/60 px-3 py-2 space-y-1.5">
          {section.options.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Checkbox
                checked={selectedValues.includes(opt.value)}
                onCheckedChange={(checked) => onToggle(opt.value, checked === true)}
                aria-label={`Filter by ${opt.label}`}
              />
              <span className="flex-1 truncate">{opt.label}</span>
              {opt.count !== undefined && (
                <span className="text-xs text-muted-foreground tabular-nums">{opt.count}</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
