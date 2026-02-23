/**
 * Support Queue Panel - disputes, billing tickets, escalation actions.
 */

import { MessageSquare, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminDisputes } from '@/hooks/use-admin'
import { cn } from '@/lib/utils'

interface SupportQueuePanelProps {
  summary: { disputes_count: number; billing_tickets: number; escalated_count: number }
  className?: string
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  open: 'destructive',
  in_review: 'warning',
  resolved: 'success',
  escalated: 'default',
}

export function SupportQueuePanel({ summary, className }: SupportQueuePanelProps) {
  const { data: disputes, isLoading } = useAdminDisputes()

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5 text-primary" />
          Support Queue
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline">{summary.disputes_count} disputes</Badge>
          <Badge variant="outline">{summary.billing_tickets} billing</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <div className="h-6 w-6 animate-pulse rounded-full bg-muted" />
          </div>
        ) : disputes && disputes.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workspace</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.slice(0, 5).map((d) => (
                <TableRow key={d.id} className="transition-colors hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {d.workspace_name ?? d.workspace_id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[d.status] ?? 'default'}>
                      {d.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {d.notes ?? '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        Review
                      </Button>
                      <Button variant="ghost" size="sm">
                        Escalate
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No items in queue</p>
            <p className="text-sm text-muted-foreground">
              All disputes and tickets are resolved
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
