/**
 * Saved searches panel - load, rename, delete saved searches
 */

import * as React from 'react'
import { Bookmark, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { SavedSearch, SearchFilterFacet } from '@/types/search'
import {
  useSavedSearches,
  useUpdateSavedSearch,
  useDeleteSavedSearch,
} from '@/hooks/use-search'

export interface SavedSearchesPanelProps {
  workspaceId?: string | null
  onLoadSearch: (search: { query: string; filters: SearchFilterFacet[] }) => void
  className?: string
}

export function SavedSearchesPanel({
  workspaceId,
  onLoadSearch,
  className,
}: SavedSearchesPanelProps) {
  const { data: savedSearches = [], isLoading } = useSavedSearches(workspaceId)
  const updateMutation = useUpdateSavedSearch()
  const deleteMutation = useDeleteSavedSearch()

  const [editId, setEditId] = React.useState<string | null>(null)
  const [editName, setEditName] = React.useState('')

  const handleRename = (s: SavedSearch) => {
    setEditId(s.id)
    setEditName(s.name)
  }

  const handleSaveRename = () => {
    if (!editId) return
    updateMutation.mutate({
      id: editId,
      payload: { name: editName },
    })
    setEditId(null)
  }

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  if (isLoading) {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (savedSearches.length === 0) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center',
          className
        )}
      >
        <Bookmark className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium text-foreground">
          No saved searches
        </p>
        <p className="text-xs text-muted-foreground">
          Save your current search to quickly reuse it later
        </p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Bookmark className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Saved searches</span>
      </div>
      <ul className="space-y-1" role="list">
        {savedSearches.map((s) => (
          <li
            key={s.id}
            className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 transition-colors hover:bg-secondary/50"
          >
            <button
              type="button"
              onClick={() => onLoadSearch({ query: s.query, filters: s.filters })}
              className="min-w-0 flex-1 text-left text-sm font-medium text-foreground hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
            >
              <span className="truncate block">{s.name}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Options for ${s.name}`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleRename(s)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDelete(s.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>

      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename saved search</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Search name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditId(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRename}
              disabled={!editName.trim() || updateMutation.isPending}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
