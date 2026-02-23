import { useState, useCallback, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  FiltersPanel,
  TransactionsTable,
  SubscriptionTimeline,
  SummaryCards,
  SupportCta,
} from '@/components/billing-history'
import { useBillingHistory } from '@/hooks/use-billing-history'
import { useBillingSubscription } from '@/hooks/use-billing'
import type { BillingHistoryFilters } from '@/components/billing-history'
import type { BillingHistoryItem } from '@/types/billing-history'

function getDefaultFilters(): BillingHistoryFilters {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - 90)
  return {
    start_date: start.toISOString().slice(0, 10),
    end_date: now.toISOString().slice(0, 10),
    date_preset: 'Last 90 days',
    types: undefined,
    query: undefined,
  }
}

function filtersFromSearchParams(params: URLSearchParams): BillingHistoryFilters {
  const start = params.get('start_date') ?? undefined
  const end = params.get('end_date') ?? undefined
  const typesParam = params.get('types')
  const types = typesParam ? (typesParam.split(',').filter(Boolean) as BillingHistoryFilters['types']) : undefined
  const query = params.get('query') ?? undefined
  return {
    start_date: start || getDefaultFilters().start_date,
    end_date: end || getDefaultFilters().end_date,
    date_preset: params.get('date_preset') ?? 'Last 90 days',
    types,
    query,
  }
}

function filtersToSearchParams(filters: BillingHistoryFilters): URLSearchParams {
  const p = new URLSearchParams()
  if (filters.start_date) p.set('start_date', filters.start_date)
  if (filters.end_date) p.set('end_date', filters.end_date)
  if (filters.date_preset) p.set('date_preset', filters.date_preset)
  if (filters.types?.length) p.set('types', filters.types.join(','))
  if (filters.query) p.set('query', filters.query)
  return p
}

export function BillingHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState<BillingHistoryFilters>(() =>
    filtersFromSearchParams(searchParams)
  )
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [receiptItem, setReceiptItem] = useState<BillingHistoryItem | null>(null)

  const subscriptionId = useBillingSubscription().data?.subscription?.id ?? null

  const historyParams = {
    start_date: filters.start_date,
    end_date: filters.end_date,
    types: filters.types,
    query: filters.query?.trim() || undefined,
    page,
    page_size: 20,
    sort_by: sortBy,
    sort_order: sortOrder,
  }

  const { data, isLoading, refetch } = useBillingHistory(historyParams)
  const items = data?.items ?? []
  const total = data?.total ?? 0

  const updateUrl = useCallback((nextFilters: BillingHistoryFilters) => {
    const p = filtersToSearchParams(nextFilters)
    setSearchParams(p, { replace: true })
  }, [setSearchParams])

  const handleFiltersChange = useCallback(
    (next: BillingHistoryFilters) => {
      setFilters(next)
      updateUrl(next)
      setPage(1)
    },
    [updateUrl]
  )

  const handleApply = useCallback(() => {
    refetch()
  }, [refetch])

  const handleReset = useCallback(() => {
    const def = getDefaultFilters()
    setFilters(def)
    updateUrl(def)
    setPage(1)
    refetch()
  }, [refetch, updateUrl])

  useEffect(() => {
    setFilters(filtersFromSearchParams(searchParams))
  }, [searchParams])

  const handleViewInvoiceByInvoiceId = useCallback(
    (invoiceId: string) => {
      const item = items.find((i: BillingHistoryItem) => i.invoice_id === invoiceId)
      if (item) {
        setReceiptItem(item)
        setHighlightedId(item.id)
      } else {
        setReceiptItem({
          id: `invoice-${invoiceId}`,
          type: 'invoice',
          date: new Date().toISOString(),
          amount: 0,
          currency: 'USD',
          status: 'paid',
          invoice_id: invoiceId,
          description: `Invoice ${invoiceId}`,
          downloadable_receipt_url: `/invoices/${invoiceId}.pdf`,
        })
      }
    },
    [items]
  )

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <Link to="/dashboard/billing">
              <ArrowLeft className="h-4 w-4" />
              Back to Billing
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Transaction & order history
          </h1>
          <p className="mt-1 text-muted-foreground">
            View payments, invoices, refunds, and subscription events
          </p>
        </div>
      </div>

      <SummaryCards />

      <FiltersPanel
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApply={handleApply}
        onReset={handleReset}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <TransactionsTable
            items={items}
            total={total}
            page={page}
            pageSize={20}
            sortBy={sortBy}
            sortOrder={sortOrder}
            isLoading={isLoading}
            onPageChange={setPage}
            onSortChange={(by, order) => {
              setSortBy(by)
              setSortOrder(order)
            }}
            onHighlightItem={setHighlightedId}
            highlightedId={highlightedId}
            receiptItem={receiptItem}
            onReceiptChange={setReceiptItem}
          />
        </div>
        <div className="space-y-6">
          <SubscriptionTimeline
            subscriptionId={subscriptionId}
            onHighlightItem={setHighlightedId}
            highlightedId={highlightedId}
            onViewInvoice={handleViewInvoiceByInvoiceId}
          />
          <SupportCta />
        </div>
      </div>
    </div>
  )
}
