import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { KNOWLEDGE_BASE_CATEGORIES } from '@/api/help'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

interface KnowledgeBaseSearchProps {
  query: string
  onQueryChange: (q: string) => void
  category: string
  onCategoryChange: (c: string) => void
  resultCount?: number
  className?: string
}

export function KnowledgeBaseSearch({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  resultCount,
  className,
}: KnowledgeBaseSearchProps) {
  const [localQuery, setLocalQuery] = React.useState(query)
  const debouncedQuery = useDebounce(localQuery, 250)

  React.useEffect(() => {
    onQueryChange(debouncedQuery)
  }, [debouncedQuery, onQueryChange])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search articles..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="pl-10 pr-10"
          aria-label="Search knowledge base"
        />
        {localQuery && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => {
              setLocalQuery('')
              onQueryChange('')
            }}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Select value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? '' : v)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {KNOWLEDGE_BASE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {typeof resultCount === 'number' && (
          <span className="text-sm text-muted-foreground">
            {resultCount} article{resultCount !== 1 ? 's' : ''} found
          </span>
        )}
      </div>
    </div>
  )
}
