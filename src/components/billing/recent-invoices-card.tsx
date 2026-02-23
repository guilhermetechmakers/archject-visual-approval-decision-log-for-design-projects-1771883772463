import { FileText, Download, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBillingInvoices } from '@/hooks/use-billing'
import { ExportButton } from './export-button'
import { Skeleton } from '@/components/ui/skeleton'

const STATUS_VARIANTS: Record<string, 'success' | 'warning' | 'destructive' | 'secondary'> = {
  paid: 'success',
  pending: 'warning',
  due: 'warning',
  overdue: 'destructive',
  failed: 'destructive',
}

interface RecentInvoicesCardProps {
  onViewAll?: () => void
}

export function RecentInvoicesCard({ onViewAll }: RecentInvoicesCardProps) {
  const { data, isLoading } = useBillingInvoices({ page: 1, limit: 5 })

  const invoices = data?.invoices ?? []

  return (
    <Card className="rounded-2xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Recent invoices</CardTitle>
          </div>
          <ExportButton />
        </div>
        <CardDescription>
          Quick access to your latest invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-foreground">No invoices yet</p>
            <p className="text-sm text-muted-foreground">
              Invoices will appear here after your first billing cycle
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {invoices.slice(0, 5).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 transition-colors hover:bg-secondary/50"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    {new Date(inv.invoice_date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {inv.invoice_number ?? inv.id}
                  </span>
                  <Badge variant={STATUS_VARIANTS[inv.status] ?? 'secondary'}>
                    {inv.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {inv.currency} {inv.amount_due.toFixed(2)}
                  </span>
                  {inv.pdf_url && (
                    <Button variant="ghost" size="icon-sm" asChild>
                      <a
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Download ${inv.invoice_number ?? inv.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {invoices.length > 0 && onViewAll && (
          <Button variant="outline" className="mt-4 w-full" onClick={onViewAll}>
            View all invoices
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
