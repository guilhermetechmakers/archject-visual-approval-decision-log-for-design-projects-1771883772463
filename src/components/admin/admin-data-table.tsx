/**
 * Admin Data Table - sortable, filterable, paginated, with optional row selection.
 */

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export interface ColumnDef<T> {
  id: string
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  sortable?: boolean
  className?: string
}

interface AdminDataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  page?: number
  pageSize?: number
  totalCount?: number
  onPageChange?: (page: number) => void
  emptyMessage?: string
  emptyIcon?: React.ElementType
  getRowId: (row: T) => string
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  hideSearch?: boolean
}

export function AdminDataTable<T>({
  columns,
  data,
  isLoading,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  page = 1,
  pageSize = 10,
  totalCount,
  onPageChange,
  emptyMessage = 'No data',
  emptyIcon: EmptyIcon,
  getRowId,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  hideSearch = false,
}: AdminDataTableProps<T>) {
  const totalPages = totalCount != null ? Math.ceil(totalCount / pageSize) : 1
  const hasSearch = onSearchChange != null && !hideSearch
  const hasPagination = onPageChange != null && totalCount != null

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  const toggleAll = () => {
    if (!onSelectionChange) return
    if (selectedIds.size === data.length) {
      onSelectionChange(new Set())
    } else {
      onSelectionChange(new Set(data.map((r) => getRowId(r))))
    }
  }

  const getCellValue = (row: T, col: ColumnDef<T>): React.ReactNode => {
    if (typeof col.accessor === 'function') {
      return col.accessor(row)
    }
    const val = row[col.accessor]
    return val != null ? String(val) : '—'
  }

  return (
    <div className="space-y-4">
      {hasSearch && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
            aria-label="Search"
          />
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-border">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            {EmptyIcon && <EmptyIcon className="h-12 w-12 text-muted-foreground" />}
            <p className="mt-4 font-medium">{emptyMessage}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={data.length > 0 && selectedIds.size === data.length}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                )}
                {columns.map((col) => (
                  <TableHead key={col.id} className={col.className}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const id = getRowId(row)
                return (
                  <TableRow
                    key={id}
                    className="transition-colors hover:bg-muted/50"
                  >
                    {selectable && (
                      <TableCell className="w-12">
                        <Checkbox
                          checked={selectedIds.has(id)}
                          onCheckedChange={() => toggleRow(id)}
                          aria-label={`Select row ${id}`}
                        />
                      </TableCell>
                    )}
                    {columns.map((col) => (
                      <TableCell key={col.id} className={col.className}>
                        {getCellValue(row, col)}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
      {hasPagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({totalCount} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
