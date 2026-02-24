import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import type { ChangeHistoryEntry } from '@/types/cookie-consent'
import { History } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ChangeHistoryTableProps {
  entries: ChangeHistoryEntry[]
  className?: string
}

function formatTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function formatCategory(cat: string): string {
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

function formatAction(action: string): string {
  return action === 'opt-in' ? 'Opt-in' : 'Opt-out'
}

/**
 * Readable table of consent changes with timestamp, category, and action.
 */
export function ChangeHistoryTable({ entries, className }: ChangeHistoryTableProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" aria-hidden />
          <h2 className="text-lg font-semibold">Change History</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Log of your consent preference changes.
        </p>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No consent changes recorded yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((entry, i) => (
                <TableRow key={`${entry.timestamp}-${entry.category}-${i}`}>
                  <TableCell className="font-medium">
                    {formatTimestamp(entry.timestamp)}
                  </TableCell>
                  <TableCell>{formatCategory(entry.category)}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex rounded-md px-2 py-0.5 text-xs font-medium',
                        entry.action === 'opt-in'
                          ? 'bg-success/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {formatAction(entry.action)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
