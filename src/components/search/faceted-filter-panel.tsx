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
import type { SearchEntityType } from '@/types/search'

export interface FacetOption {
  value: string
  label: string
  count?: number
}

export interface FacetSection {
  id: string
  label: string
  options: FacetOption[]
  collapsed?: boolean
  multiSelect?: boolean
}

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

const ENTITY_LABELS: Record<SearchEntityType, string> = {
  project: 'Projects',
  decision: 'Decisions',
  file: 'Files',
  comment: 'Comments',
}

export function buildFacetSectionsFromResults(
  results: { type: SearchEntityType; status?: string; projectName?: string }[],
  projects: { id: string; name: string }[] = []
): FacetSection[] {
  const typeCounts: Record<string, number> = {}
  const statusCounts: Record<string, number> = {}
  const projectCounts: Record<string, number> = {}

  for (const r of results) {
    typeCounts[r.type] = (typeCounts[r.type] ?? 0) + 1
    if (r.status) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1
    if (r.projectName) projectCounts[r.projectName] = (projectCounts[r.projectName] ?? 0) + 1
  }

  const typeOptions: FacetOption[] = (['project', 'decision', 'file', 'comment'] as SearchEntityType[]).map(
    (t) => ({ value: t, label: ENTITY_LABELS[t], count: typeCounts[t] })
  )
  const statusOptions: FacetOption[] = Object.entries(statusCounts).map(([v, c]) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
    count: c,
  }))
  const projectOptions: FacetOption[] = projects.length
    ? projects.map((p) => ({ value: p.id, label: p.name, count: projectCounts[p.name] ?? 0 }))
    : Object.entries(projectCounts).map(([name, c]) => ({ value: name, label: name, count: c }))

  return [
    { id: 'entity_type', label: 'Type', options: typeOptions, collapsed: false },
    { id: 'status', label: 'Status', options: statusOptions, collapsed: statusOptions.length > 4 },
    { id: 'project_id', label: 'Project', options: projectOptions.slice(0, 20), collapsed: true },
  ]
}
