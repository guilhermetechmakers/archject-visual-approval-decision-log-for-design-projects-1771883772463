import { useState } from 'react'
import { GitCompare, Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CollapsibleSection } from './collapsible-section'
import { cn } from '@/lib/utils'
import type { VersionDiff, FieldDiff, DecisionVersion } from '@/types/edit-decision'

const DIFF_COLORS: Record<FieldDiff['type'], string> = {
  added: 'bg-success/20 text-success border-success/30',
  removed: 'bg-destructive/20 text-destructive border-destructive/30',
  modified: 'bg-warning/20 text-warning-muted border-warning-muted/30',
}

export interface VersionComparePanelProps {
  versions: DecisionVersion[]
  currentVersionId: string
  diff: VersionDiff | null
  isLoading?: boolean
  onCompare: (fromVersionId: string, toVersionId: string) => void
  fromVersionId?: string | null
  toVersionId?: string | null
  onFromChange?: (id: string) => void
  onToChange?: (id: string) => void
  filterTypes?: ('metadata' | 'options' | 'media' | 'comments')[]
  onFilterChange?: (types: ('metadata' | 'options' | 'media' | 'comments')[]) => void
  className?: string
}

export function VersionComparePanel({
  versions,
  currentVersionId,
  diff,
  isLoading = false,
  onCompare,
  fromVersionId,
  toVersionId,
  onFromChange,
  onToChange,
  filterTypes = ['metadata', 'options'],
  onFilterChange,
  className,
}: VersionComparePanelProps) {
  const [localFrom, setLocalFrom] = useState(fromVersionId ?? '')
  const [localTo, setLocalTo] = useState(toVersionId ?? currentVersionId)
  const [localFilters, setLocalFilters] = useState(filterTypes)

  const handleCompare = () => {
    if (localFrom && localTo) {
      onFromChange?.(localFrom)
      onToChange?.(localTo)
      onCompare(localFrom, localTo)
    }
  }

  const toggleFilter = (type: (typeof filterTypes)[number]) => {
    const next = localFilters.includes(type)
      ? localFilters.filter((t) => t !== type)
      : [...localFilters, type]
    setLocalFilters(next)
    onFilterChange?.(next)
  }

  return (
    <CollapsibleSection
      title="Version Compare"
      defaultOpen={false}
      className={className}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={localFrom}
            onValueChange={setLocalFrom}
          >
            <SelectTrigger className="w-[140px]" aria-label="From version">
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  v{v.version_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground">→</span>
          <Select
            value={localTo}
            onValueChange={setLocalTo}
          >
            <SelectTrigger className="w-[140px]" aria-label="To version">
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  v{v.version_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={handleCompare}
            disabled={isLoading || !localFrom || !localTo}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-50"
          >
            <GitCompare className="h-4 w-4" />
            Compare
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {(['metadata', 'options', 'media', 'comments'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleFilter(t)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                localFilters.includes(t)
                  ? 'bg-primary/10 text-primary'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-full rounded bg-secondary" />
            <div className="h-4 w-3/4 rounded bg-secondary" />
            <div className="h-4 w-1/2 rounded bg-secondary" />
          </div>
        )}

        {diff && !isLoading && (
          <div className="space-y-6">
            {localFilters.includes('metadata') && diff.metadata_diffs.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Metadata</h4>
                <ul className="space-y-2">
                  {diff.metadata_diffs.map((d, i) => (
                    <DiffItem key={i} item={d} />
                  ))}
                </ul>
              </div>
            )}
            {localFilters.includes('options') && diff.options_diffs.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Options</h4>
                <ul className="space-y-2">
                  {diff.options_diffs.map((d, i) => (
                    <DiffItem key={i} item={d} />
                  ))}
                </ul>
              </div>
            )}
            {localFilters.includes('media') && diff.media_diffs.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Media</h4>
                <ul className="space-y-2">
                  {diff.media_diffs.map((d, i) => (
                    <DiffItem key={i} item={d} />
                  ))}
                </ul>
              </div>
            )}
            {localFilters.includes('comments') && diff.comments_diffs.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Comments</h4>
                <ul className="space-y-2">
                  {diff.comments_diffs.map((d, i) => (
                    <DiffItem key={i} item={d} />
                  ))}
                </ul>
              </div>
            )}
            {diff.metadata_diffs.length === 0 &&
              diff.options_diffs.length === 0 &&
              diff.media_diffs.length === 0 &&
              diff.comments_diffs.length === 0 && (
                <p className="text-sm text-muted-foreground">No changes in selected filters.</p>
              )}
          </div>
        )}

        {!diff && !isLoading && (
          <p className="text-sm text-muted-foreground">
            Select two versions and click Compare to see differences.
          </p>
        )}
      </div>
    </CollapsibleSection>
  )
}

function DiffItem({ item }: { item: FieldDiff }) {
  const colorClass = DIFF_COLORS[item.type]
  return (
    <li
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        colorClass
      )}
    >
      <span className="font-medium">{item.field}</span>
      {item.type === 'modified' && (
        <div className="mt-1 space-y-1 text-xs">
          <p>
            <span className="opacity-75">Old:</span>{' '}
            {String(item.oldValue ?? '—')}
          </p>
          <p>
            <span className="opacity-75">New:</span>{' '}
            {String(item.newValue ?? '—')}
          </p>
        </div>
      )}
      {item.type === 'added' && (
        <p className="mt-1 text-xs">{String(item.newValue ?? '')}</p>
      )}
      {item.type === 'removed' && (
        <p className="mt-1 text-xs">{String(item.oldValue ?? '')}</p>
      )}
    </li>
  )
}
