import { useState } from 'react'
import { Search, Link2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { LibraryFile } from '@/types/files-library'
import type { Decision } from '@/types/workspace'

export interface DecisionAttachmentModalProps {
  file: LibraryFile | null
  decisions: Decision[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAttach: (decisionId: string, optionId?: string) => void
  isAttaching?: boolean
}

export function DecisionAttachmentModal({
  file,
  decisions,
  open,
  onOpenChange,
  onAttach,
  isAttaching = false,
}: DecisionAttachmentModalProps) {
  const [search, setSearch] = useState('')
  const [selectedDecisionId, setSelectedDecisionId] = useState<string | null>(
    null
  )

  const filteredDecisions = decisions.filter((d) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return d.title.toLowerCase().includes(q)
  })

  const handleAttach = () => {
    if (selectedDecisionId) {
      onAttach(selectedDecisionId)
      onOpenChange(false)
      setSelectedDecisionId(null)
      setSearch('')
    }
  }

  const alreadyLinked = file?.linkedDecisions?.map((a) => a.decisionId) ?? []
  const availableDecisions = filteredDecisions.filter(
    (d) => !alreadyLinked.includes(d.id)
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Attach to Decision</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {file?.name
              ? `Link "${file.name}" to a decision`
              : 'Select a decision to attach this file to.'}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search decisions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search decisions"
            />
          </div>

          <ScrollArea className="h-[240px] rounded-lg border border-border">
            <div className="p-2 space-y-1">
              {availableDecisions.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  {filteredDecisions.length === 0
                    ? 'No decisions found'
                    : 'All decisions already have this file linked'}
                </div>
              ) : (
                availableDecisions.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      setSelectedDecisionId((prev) =>
                        prev === d.id ? null : d.id
                      )
                    }
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                      selectedDecisionId === d.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-secondary/50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-sm">{d.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {d.status}
                      </p>
                    </div>
                    {selectedDecisionId === d.id && (
                      <Link2 className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAttach}
            disabled={!selectedDecisionId || isAttaching}
          >
            {isAttaching ? 'Linking...' : 'Attach'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
