/**
 * GlobalSearchBar - real-time autocomplete with keyboard navigation
 * Debounced 250ms, arrow keys + Enter to select
 */

import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, FolderKanban, FileCheck, FileText, MessageSquare } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useSearchAutocomplete } from '@/hooks/use-search'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'
import type { SearchEntityType } from '@/types/search'

const ENTITY_ICONS: Record<SearchEntityType, React.ElementType> = {
  project: FolderKanban,
  decision: FileCheck,
  file: FileText,
  comment: MessageSquare,
}

export interface GlobalSearchBarProps {
  className?: string
  placeholder?: string
  onSelect?: (href: string) => void
  /** When true, Enter without selection navigates to /dashboard/search?q=... */
  submitToSearchPage?: boolean
  entityTypes?: SearchEntityType[]
}

export function GlobalSearchBar({
  className,
  placeholder = 'Search projects, decisions, files...',
  onSelect,
  submitToSearchPage = true,
  entityTypes,
}: GlobalSearchBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = React.useState('')
  const [isOpen, setIsOpen] = React.useState(false)
  const [highlightIndex, setHighlightIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const debouncedQuery = useDebounce(query, 250)
  const { data, isLoading } = useSearchAutocomplete(debouncedQuery, {
    entityTypes,
    enabled: debouncedQuery.trim().length >= 2,
  })
  const suggestions = data?.suggestions ?? []
  const hasItems = suggestions.length > 0

  React.useEffect(() => {
    setHighlightIndex(0)
  }, [debouncedQuery, suggestions])

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = React.useCallback(
    (href: string) => {
      if (onSelect) {
        onSelect(href)
      } else if (href.startsWith('/')) {
        navigate(href)
      } else if (href.startsWith('?')) {
        navigate(`/dashboard/search${href}`)
      }
      setIsOpen(false)
      setQuery('')
      inputRef.current?.blur()
    },
    [navigate, onSelect]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q && submitToSearchPage) {
      navigate(`/dashboard/search?q=${encodeURIComponent(q)}`)
      setIsOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || !hasItems) {
      if (e.key === 'Enter' && query.trim() && submitToSearchPage) {
        handleSubmit(e as unknown as React.FormEvent)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex((i) => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (suggestions[highlightIndex]) {
          handleSelect(suggestions[highlightIndex].href)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setQuery('')
        inputRef.current?.blur()
        break
      default:
        break
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setIsOpen(true)
  }

  const handleFocus = () => {
    if (query.trim().length >= 2) setIsOpen(true)
  }

  return (
    <div ref={containerRef} className={cn('relative flex-1 max-w-md', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="pl-9 rounded-lg bg-input transition-all focus:ring-2 focus:ring-primary/20"
          aria-label="Global search"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={isOpen && hasItems}
          role="combobox"
        />
      </form>

      {isOpen && debouncedQuery.trim().length >= 2 && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-card animate-fade-in"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              Searching...
            </div>
          ) : hasItems ? (
            <ul className="max-h-[320px] overflow-y-auto py-2">
              {suggestions.map((item, i) => {
                const Icon = ENTITY_ICONS[item.type]

                return (
                  <li key={item.id} role="option" aria-selected={i === highlightIndex}>
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                        i === highlightIndex
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted/50 text-foreground'
                      )}
                      onMouseEnter={() => setHighlightIndex(i)}
                      onClick={() => handleSelect(item.href)}
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{item.title}</p>
                        {item.excerpt && (
                          <p className="truncate text-xs text-muted-foreground">{item.excerpt}</p>
                        )}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No results for &quot;{debouncedQuery}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  )
}
