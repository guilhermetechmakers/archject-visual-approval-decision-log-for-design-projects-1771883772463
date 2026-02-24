import { Search, Filter, X, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { FileFilters, PreviewStatus } from '@/types/files-library'
import type { FileType } from '@/types/workspace'

const FILE_TYPES: { value: FileType; label: string }[] = [
  { value: 'drawing', label: 'Drawing' },
  { value: 'spec', label: 'Specification' },
  { value: 'image', label: 'Image' },
  { value: 'BIM', label: 'BIM' },
]

const PREVIEW_STATUSES: { value: PreviewStatus; label: string }[] = [
  { value: 'queued', label: 'Queued' },
  { value: 'processing', label: 'Processing' },
  { value: 'available', label: 'Ready' },
  { value: 'failed', label: 'Failed' },
]

export interface FiltersBarProps {
  filters: FileFilters
  onFiltersChange: (filters: FileFilters) => void
  searchPlaceholder?: string
  className?: string
}

export function FiltersBar({
  filters,
  onFiltersChange,
  searchPlaceholder = 'Search files...',
  className,
}: FiltersBarProps) {
  const handleSearch = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined })
  }

  const handleTypeChange = (value: string) => {
    if (value === 'all') {
      const { type: _, ...rest } = filters
      onFiltersChange(rest)
    } else {
      onFiltersChange({
        ...filters,
        type: [value as FileType],
      })
    }
  }

  const handleLinkedChange = (value: string) => {
    if (value === 'all') {
      const { linkedDecision: _, ...rest } = filters
      onFiltersChange(rest)
    } else {
      onFiltersChange({
        ...filters,
        linkedDecision: value === 'linked',
      })
    }
  }

  const handlePreviewStatusChange = (value: string) => {
    if (value === 'all') {
      const { previewStatus: _, ...rest } = filters
      onFiltersChange(rest)
    } else {
      onFiltersChange({
        ...filters,
        previewStatus: [value as PreviewStatus],
      })
    }
  }

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value || undefined
    onFiltersChange({ ...filters, dateFrom: v })
  }

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value || undefined
    onFiltersChange({ ...filters, dateTo: v })
  }

  const handleClearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters =
    filters.type?.length ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.linkedDecision !== undefined ||
    filters.previewStatus?.length ||
    (filters.search?.trim().length ?? 0) > 0

  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      role="search"
      aria-label="Filter and search files"
    >
      <div className="relative flex-1 sm:max-w-xs">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={filters.search ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
          aria-label="Search files"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Select
            value={filters.type?.[0] ?? 'all'}
            onValueChange={handleTypeChange}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {FILE_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select
          value={
            filters.linkedDecision === true
              ? 'linked'
              : filters.linkedDecision === false
                ? 'unlinked'
                : 'all'
          }
          onValueChange={handleLinkedChange}
        >
          <SelectTrigger className="w-[140px]" aria-label="Filter by link status">
            <SelectValue placeholder="Linked" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All files</SelectItem>
            <SelectItem value="linked">Linked to decisions</SelectItem>
            <SelectItem value="unlinked">Not linked</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground"
            aria-label="Clear filters"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
