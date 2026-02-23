/**
 * Top templates table - usage, avg time, success rate
 */

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TemplatePerformance } from '@/types/analytics'

export type TemplateSortField = 'name' | 'usageCount' | 'avgApprovalTimeHours' | 'successRate'
export type TemplateSortOrder = 'asc' | 'desc'

export interface AnalyticsTemplatesTableProps {
  data: TemplatePerformance[]
  sortBy?: TemplateSortField
  sortOrder?: TemplateSortOrder
  onSort?: (field: TemplateSortField) => void
  isLoading?: boolean
  headerActions?: React.ReactNode
  className?: string
}

function formatHours(hours: number): string {
  if (hours < 24) return `${Math.round(hours)}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

export function AnalyticsTemplatesTable({
  data,
  sortBy = 'usageCount',
  sortOrder = 'desc',
  onSort,
  isLoading,
  headerActions,
  className,
}: AnalyticsTemplatesTableProps) {
  const SortIcon = ({ field }: { field: TemplateSortField }) => {
    if (sortBy !== field) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4 inline" />
    ) : (
      <ChevronDown className="h-4 w-4 inline" />
    )
  }

  const sortableHeader = (field: TemplateSortField, label: string) => (
    <button
      type="button"
      onClick={() => onSort?.(field)}
      className="flex items-center gap-1 font-medium hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
    >
      {label}
      <SortIcon field={field} />
    </button>
  )

  if (isLoading) {
    return (
      <Card className={cn('rounded-2xl border border-border shadow-card', className)}>
        <CardHeader>
          <CardTitle>Template performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('rounded-2xl border border-border shadow-card', className)}>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>Template performance</CardTitle>
            <p className="text-sm text-muted-foreground">
              Usage frequency, average approval time, success rate
            </p>
          </div>
          {headerActions}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">No template data in this period</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-border">
                  <TableHead>{sortableHeader('name', 'Template')}</TableHead>
                  <TableHead>{sortableHeader('usageCount', 'Usage')}</TableHead>
                  <TableHead>{sortableHeader('avgApprovalTimeHours', 'Avg time')}</TableHead>
                  <TableHead>{sortableHeader('successRate', 'Success rate')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow
                    key={row.id}
                    className="transition-colors hover:bg-secondary/50"
                  >
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.usageCount}</TableCell>
                    <TableCell>{formatHours(row.avgApprovalTimeHours)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'font-medium',
                          row.successRate >= 80
                            ? 'text-success'
                            : row.successRate >= 60
                              ? 'text-warning'
                              : 'text-destructive'
                        )}
                      >
                        {row.successRate}%
                      </span>
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
