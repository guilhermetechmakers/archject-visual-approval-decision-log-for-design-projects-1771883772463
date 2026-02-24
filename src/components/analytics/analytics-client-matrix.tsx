/**
 * Client responsiveness matrix - clients vs avg response time and response rate
 */

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ClientResponsiveness } from '@/types/analytics'

export type ClientMatrixSortField = 'avgResponseTimeHours' | 'responseRate'

export interface AnalyticsClientMatrixProps {
  data: ClientResponsiveness[]
  sortBy?: ClientMatrixSortField
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: ClientMatrixSortField) => void
  className?: string
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

function getRateVariant(rate: number): string {
  if (rate >= 80) return 'text-success'
  if (rate >= 60) return 'text-warning'
  return 'text-destructive'
}

function SortHeader({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
}: {
  field: ClientMatrixSortField
  label: string
  sortBy?: ClientMatrixSortField
  sortOrder?: 'asc' | 'desc'
  onSort?: (field: ClientMatrixSortField) => void
}) {
  if (!onSort) return <span className="font-medium">{label}</span>
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 font-medium"
      onClick={() => onSort(field)}
      aria-label={`Sort by ${label} ${sortBy === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
    >
      {label}
      {sortBy === field ? (
        sortOrder === 'asc' ? (
          <ArrowUp className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDown className="ml-1 h-3 w-3" />
        )
      ) : (
        <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />
      )}
    </Button>
  )
}

export function AnalyticsClientMatrix({
  data,
  sortBy,
  sortOrder,
  onSort,
  className,
}: AnalyticsClientMatrixProps) {
  return (
    <Card className={cn('rounded-2xl border border-border shadow-card', className)}>
      <CardHeader>
        <CardTitle>Client responsiveness matrix</CardTitle>
        <p className="text-sm text-muted-foreground">
          Clients vs avg response time and response rate
        </p>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">No client data in this period</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try selecting a different date range
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead className="font-medium">Client</TableHead>
                  <TableHead className="font-medium text-right">
                    <SortHeader
                      field="avgResponseTimeHours"
                      label="Avg response"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={onSort}
                    />
                  </TableHead>
                  <TableHead className="font-medium text-right">
                    <SortHeader
                      field="responseRate"
                      label="Response rate"
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSort={onSort}
                    />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((client) => (
                  <TableRow
                    key={client.clientId}
                    className="transition-colors hover:bg-secondary/50"
                  >
                    <TableCell className="font-medium truncate max-w-[180px]" title={client.clientName}>
                      {client.clientName}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatHours(client.avgResponseTimeHours)}
                    </TableCell>
                    <TableCell className={cn('text-right font-medium', getRateVariant(client.responseRate))}>
                      {client.responseRate}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
