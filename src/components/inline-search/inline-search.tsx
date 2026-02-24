/**
 * Reusable InlineSearch component for quick lookup of projects, decisions, or files.
 * Used on 404 page and can be reused elsewhere.
 * - Rounded input with subtle background (#F5F6FA)
 * - Magnifying glass icon at left
 * - Optional dropdown with suggestions (title + type tag)
 * - Keyboard: Enter to navigate, Arrow keys to traverse
 */

import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface SearchResult {
  id: string
  title: string
  type: 'project' | 'decision' | 'file'
  href: string
}

export interface InlineSearchProps {
  /** Placeholder text */
  placeholder?: string
  /** Optional results to show (e.g. from API). For 404, mock results are used. */
  results?: SearchResult[]
  /** Called when user selects a result - navigate via href */
  onSelect?: (result: SearchResult) => void
  /** Optional callback when search is submitted (e.g. to fetch results) */
  onSearch?: (query: string) => void
  className?: string
  /** Ref to focus the input (e.g. when Search button is clicked) */
  inputRef?: React.RefObject<HTMLInputElement | null>
  /** aria-label for accessibility */
  'aria-label'?: string
}

/** Mock results for 404 page when no real search is wired */
const MOCK_RESULTS: SearchResult[] = [
  { id: '1', title: 'Brand Refresh Q1', type: 'project', href: '/dashboard/projects/1' },
  { id: '2', title: 'Homepage Redesign Approval', type: 'decision', href: '/dashboard/decisions/1' },
  { id: '3', title: 'Logo variants v2', type: 'file', href: '/dashboard/projects/1/files' },
  { id: '4', title: 'Design system decisions', type: 'decision', href: '/dashboard/decisions/2' },
  { id: '5', title: 'Brand guidelines.pdf', type: 'file', href: '/dashboard/projects/1/files' },
]

export function InlineSearch({
  placeholder = 'Search projects, decisions, or files…',
  results: externalResults,
  onSelect,
  onSearch,
  className,
  inputRef: externalInputRef,
  'aria-label': ariaLabel = 'Search projects, decisions, or files',
}: InlineSearchProps) {
  const navigate = useNavigate()
  const internalInputRef = useRef<HTMLInputElement>(null)
  const inputRef = externalInputRef ?? internalInputRef
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const results = React.useMemo(() => {
    if (externalResults) return externalResults
    const q = query.trim().toLowerCase()
    if (!q) return []
    return MOCK_RESULTS.filter((r) => r.title.toLowerCase().includes(q)).slice(0, 6)
  }, [externalResults, query])
  const showDropdown = results.length > 0 && isOpen

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onSelect?.(result)
      navigate(result.href)
      setQuery('')
      setIsOpen(false)
    },
    [navigate, onSelect]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showDropdown) {
        if (e.key === 'Enter' && query.trim().length > 0) {
          onSearch?.(query.trim())
        }
        return
      }
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((i) => (i + 1) % results.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((i) => (i - 1 + results.length) % results.length)
          break
        case 'Enter':
          e.preventDefault()
          handleSelect(results[highlightedIndex])
          break
        case 'Escape':
          setIsOpen(false)
          break
        default:
          break
      }
    },
    [showDropdown, results, highlightedIndex, query, onSearch, handleSelect]
  )

  const handleFocus = useCallback(() => {
    if (results.length > 0) setIsOpen(true)
  }, [results.length])

  const handleBlur = useCallback(() => {
    setTimeout(() => setIsOpen(false), 150)
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setQuery(v)
      setHighlightedIndex(0)
      if (v.trim().length > 0) setIsOpen(true)
      else setIsOpen(false)
    },
    []
  )

  const typeLabel = (type: SearchResult['type']) =>
    type === 'project' ? 'Project' : type === 'decision' ? 'Decision' : 'File'

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-md', className)}>
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          ref={inputRef}
          type="search"
          role="combobox"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          aria-label={ariaLabel}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls={showDropdown ? 'inline-search-results' : undefined}
          aria-activedescendant={
            showDropdown ? `inline-search-result-${highlightedIndex}` : undefined
          }
          className="pl-10 bg-[#F5F6FA] border-border rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
      {showDropdown && (
        <ul
          id="inline-search-results"
          role="listbox"
          className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-card py-1 shadow-card z-50 animate-fade-in"
        >
          {results.map((r, i) => (
            <li
              key={r.id}
              id={`inline-search-result-${i}`}
              role="option"
              aria-selected={i === highlightedIndex}
              className={cn(
                'flex items-center justify-between gap-2 px-3 py-2 cursor-pointer transition-colors',
                i === highlightedIndex
                  ? 'bg-secondary text-foreground'
                  : 'hover:bg-secondary/80'
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(r)
              }}
            >
              <span className="truncate text-sm font-medium">{r.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {typeLabel(r.type)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
