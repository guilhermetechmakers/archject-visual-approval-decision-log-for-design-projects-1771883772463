import { useState, useCallback } from 'react'
import {
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FileText,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusBadge } from './status-badge'
import { ReceiptDownloadDrawer } from './receipt-download-drawer'
import { Skeleton } from '@/components/ui/skeleton'
import type { BillingHistoryItem, TransactionType } from '@/types/billing-history'
import { cn } from '@/lib/utils'

const TYPE_LABELS: Record<TransactionType, string> = {
  invoice: 'Invoice',
  payment: 'Payment',
  refund: 'Refund',
  charge: 'Charge',
  proration: 'Proration',
  trial: 'Trial',
  renewal: 'Renewal',
  suspension: 'Suspension',
  cancellation: 'Cancellation',
  add_on: 'Add-on',
  plan_change: 'Plan change',
}

interface TransactionsTableProps {
  items: BillingHistoryItem[]
  total: number
  page: number
  pageSize: number
  sortBy: 'date' | 'type' | 'amount'
  sortOrder: 'asc' | 'desc'
  isLoading?: boolean
  onPageChange: (page: number) => void
  onSortChange: (sortBy: 'date' | 'type' | 'amount', sortOrder: 'asc' | 'desc') => void
  onHighlightItem?: (id: string | null) => void
  highlightedId?: string | null
  receiptItem?: BillingHistoryItem | null
  onReceiptChange?: (item: BillingHistoryItem | null) => void
}

function formatAmount(amount: number, currency: string): string {
  const formatted = Math.abs(amount).toFixed(2)
  const prefix = amount < 0 ? '-' : ''
  return `${prefix}${currency} ${formatted}`
}

function TransactionRow({
  item,
  onDownload,
  onViewInvoice,
  isHighlighted,
}: {
  item: BillingHistoryItem
  onDownload: (item: BillingHistoryItem) => void
  onViewInvoice?: (item: BillingHistoryItem) => void
  isHighlighted?: boolean
}) {
  const hasReceipt = !!item.downloadable_receipt_url || !!item.invoice_id

  return (
    <TableRow
      className={cn(
        'transition-colors hover:bg-secondary/50 cursor-default',
        isHighlighted && 'bg-primary/5 ring-1 ring-primary/20'
      )}
    >
      <TableCell className="font-medium">
        {new Date(item.date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {TYPE_LABELS[item.type] ?? item.type}
      </TableCell>
      <TableCell className="max-w-[200px] truncate" title={item.description}>
        {item.description}
      </TableCell>
      <TableCell className="font-medium tabular-nums">
        {formatAmount(item.amount, item.currency)}
      </TableCell>
      <TableCell>
        <StatusBadge status={item.status} />
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {item.invoice_id ?? item.receipt_id ?? '—'}
      </TableCell>
      <TableCell className="w-[100px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              aria-label="Row actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            {hasReceipt && (
              <DropdownMenuItem onClick={() => onDownload(item)}>
                <Download className="h-4 w-4" />
                Download receipt
              </DropdownMenuItem>
            )}
            {item.invoice_id && onViewInvoice && (
              <DropdownMenuItem onClick={() => onViewInvoice(item)}>
                <ExternalLink className="h-4 w-4" />
                View invoice
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {hasReceipt && (
          <Button
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 ml-1"
            onClick={() => onDownload(item)}
            aria-label={`Download receipt for ${item.invoice_id ?? item.id}`}
          >
            <Download className="h-4 w-4 text-primary" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}

export function TransactionsTable({
  items,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
  isLoading,
  onPageChange,
  onSortChange,
  onHighlightItem: _onHighlightItem,
  highlightedId,
  receiptItem: controlledReceiptItem,
  onReceiptChange,
}: TransactionsTableProps) {
  const [internalReceiptItem, setInternalReceiptItem] = useState<BillingHistoryItem | null>(null)
  const isControlled = onReceiptChange !== undefined
  const receiptItem = isControlled ? (controlledReceiptItem ?? null) : internalReceiptItem
  const setReceiptItem = isControlled
    ? (item: BillingHistoryItem | null) => onReceiptChange(item)
    : setInternalReceiptItem
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasNext = page < totalPages
  const hasPrev = page > 1

  const handleSort = useCallback(
    (column: 'date' | 'type' | 'amount') => {
      const nextOrder =
        sortBy === column && sortOrder === 'desc' ? 'asc' : 'desc'
      onSortChange(column, nextOrder)
    },
    [sortBy, sortOrder, onSortChange]
  )

  const renderSortIcon = (column: 'date' | 'type' | 'amount') => {
    if (sortBy !== column) return null
    return sortOrder === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    )
  }

  return (
    <>
      <Card className="rounded-2xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Transactions</CardTitle>
                <CardDescription>
                  View and download your payment history
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No transactions found
              </p>
              <p className="text-sm text-muted-foreground">
                Adjust your filters or date range to see more results
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleSort('date')}
                          className="flex items-center gap-1 font-medium hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
                        >
                          Date
                          {renderSortIcon('date')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleSort('type')}
                          className="flex items-center gap-1 font-medium hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
                        >
                          Type
                          {renderSortIcon('type')}
                        </button>
                      </TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>
                        <button
                          type="button"
                          onClick={() => handleSort('amount')}
                          className="flex items-center gap-1 font-medium hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
                        >
                          Amount
                          {renderSortIcon('amount')}
                        </button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice / Receipt</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TransactionRow
                        key={item.id}
                        item={item}
                        onDownload={setReceiptItem}
                        onViewInvoice={
                          item.invoice_id
                            ? (i) => {
                                setReceiptItem(i)
                              }
                            : undefined
                        }
                        isHighlighted={highlightedId === item.id}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
              {totalPages > 1 && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages} ({total} transactions)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(Math.max(1, page - 1))}
                      disabled={!hasPrev}
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                      disabled={!hasNext}
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <ReceiptDownloadDrawer
        item={receiptItem}
        open={!!receiptItem}
        onOpenChange={(open) => !open && setReceiptItem(null)}
      />
    </>
  )
}
