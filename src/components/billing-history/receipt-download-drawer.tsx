import { useCallback } from 'react'
import { Download, FileText, FileJson } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import type { BillingHistoryItem } from '@/types/billing-history'
import { toast } from 'sonner'

interface ReceiptDownloadDrawerProps {
  item: BillingHistoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatAmount(amount: number, currency: string): string {
  const formatted = Math.abs(amount).toFixed(2)
  const prefix = amount < 0 ? '-' : ''
  return `${prefix}${currency} ${formatted}`
}

export function ReceiptDownloadDrawer({
  item,
  open,
  onOpenChange,
}: ReceiptDownloadDrawerProps) {
  const handleDownloadPdf = useCallback(() => {
    if (!item) return
    const url = item.downloadable_receipt_url ?? `#invoice-${item.invoice_id}`
    if (url.startsWith('http') || url.startsWith('/')) {
      window.open(url, '_blank')
      toast.success('Opening receipt…')
    } else {
      toast.success('Receipt download initiated')
    }
    onOpenChange(false)
  }, [item, onOpenChange])

  const handleDownloadCsv = useCallback(() => {
    if (!item) return
    const rows = [
      ['Invoice ID', 'Date', 'Amount', 'Currency', 'Description', 'Status'],
      [
        item.invoice_id ?? item.receipt_id ?? item.id,
        new Date(item.date).toISOString(),
        String(item.amount),
        item.currency,
        item.description,
        item.status,
      ],
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${item.invoice_id ?? item.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV downloaded')
    onOpenChange(false)
  }, [item, onOpenChange])

  const handleDownloadJson = useCallback(() => {
    if (!item) return
    const data = {
      invoice_id: item.invoice_id,
      receipt_id: item.receipt_id,
      date: item.date,
      amount: item.amount,
      currency: item.currency,
      description: item.description,
      status: item.status,
      type: item.type,
      subscription_id: item.subscription_id,
      payment_method: item.payment_method,
      last4: item.last4,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${item.invoice_id ?? item.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('JSON downloaded')
    onOpenChange(false)
  }, [item, onOpenChange])

  if (!item) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col"
        aria-describedby="receipt-drawer-description"
      >
        <SheetHeader>
          <SheetTitle>Download receipt</SheetTitle>
          <SheetDescription id="receipt-drawer-description">
            Choose a format to download your receipt or invoice
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 flex flex-1 flex-col gap-6">
          <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              {item.invoice_id ?? item.receipt_id ?? item.id}
            </p>
            <p className="text-sm text-muted-foreground">
              {new Date(item.date).toLocaleDateString(undefined, {
                dateStyle: 'long',
              })}
            </p>
            <p className="text-lg font-semibold">
              {formatAmount(item.amount, item.currency)}
            </p>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            {item.subscription_id && (
              <p className="text-xs text-muted-foreground">
                Subscription: {item.subscription_id}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-foreground">
              Download options
            </p>
            <div className="flex flex-col gap-2">
              {item.downloadable_receipt_url && (
                <Button
                  variant="outline"
                  className="w-full justify-start rounded-lg"
                  onClick={handleDownloadPdf}
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg"
                onClick={handleDownloadCsv}
              >
                <FileText className="h-4 w-4" />
                Export as CSV
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-lg"
                onClick={handleDownloadJson}
              >
                <FileJson className="h-4 w-4" />
                Export as JSON
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
