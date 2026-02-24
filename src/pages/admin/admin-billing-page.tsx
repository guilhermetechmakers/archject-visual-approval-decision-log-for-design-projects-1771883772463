import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  CreditCard,
  RefreshCw,
  Download,
  Search,
  Receipt,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useBillingInvoices, useBillingRefund } from '@/hooks/use-billing'
import { fetchAdminBillingExceptions } from '@/api/admin'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-success/20 text-success',
  due: 'bg-warning/20 text-warning-muted',
  past_due: 'bg-destructive/20 text-destructive',
  pending: 'bg-muted text-muted-foreground',
  refunded: 'bg-muted text-muted-foreground',
}

export function AdminBillingPage() {
  const [activeTab, setActiveTab] = useState('invoices')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<{
    id: string
    charge_id?: string
    payment_intent_id?: string
    amount: number
    status: string
  } | null>(null)
  const [refundAmount, setRefundAmount] = useState<string>('')
  const [refundReason, setRefundReason] = useState('requested_by_customer')

  const { data: invoicesData, isLoading: invoicesLoading } = useBillingInvoices({
    page: 1,
    limit: 50,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })
  const { data: billingExceptions } = useQuery({
    queryKey: ['admin', 'billing-exceptions'],
    queryFn: () => fetchAdminBillingExceptions(),
  })
  const refundMutation = useBillingRefund()

  const invoices = invoicesData?.invoices ?? []
  const filteredInvoices = searchQuery.trim()
    ? invoices.filter(
        (inv) =>
          inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (inv.invoice_number ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : invoices

  const handleRefundClick = (invoice: { id: string; amount_due: number; status: string }) => {
    const amountCents = invoice.amount_due >= 100 ? invoice.amount_due : Math.round(invoice.amount_due * 100)
    setSelectedInvoice({
      id: invoice.id,
      amount: amountCents,
      status: invoice.status,
    })
    setRefundAmount((amountCents / 100).toFixed(2))
    setRefundModalOpen(true)
  }

  const handleRefundSubmit = async () => {
    if (!selectedInvoice) return
    const amountCents = Math.round(parseFloat(refundAmount || '0') * 100)
    if (amountCents <= 0) {
      toast.error('Enter a valid refund amount')
      return
    }
    try {
      await refundMutation.mutateAsync({
        payment_intent_id: selectedInvoice.payment_intent_id,
        charge_id: selectedInvoice.charge_id,
        amount: amountCents,
        reason: refundReason,
      })
      toast.success('Refund initiated')
      setRefundModalOpen(false)
      setSelectedInvoice(null)
    } catch {
      toast.error('Refund failed')
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Billing & invoices
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage invoices, refunds, and billing exceptions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-secondary p-1">
          <TabsTrigger
            value="invoices"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="exceptions"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            Exceptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-0 space-y-6">
          <Card className="rounded-2xl border border-border shadow-card">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Invoice management</CardTitle>
                  <CardDescription>
                    View, search, and process refunds
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-48 rounded-lg"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36 rounded-lg">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="due">Due</SelectItem>
                      <SelectItem value="past_due">Past due</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                  <Receipt className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No invoices found
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Adjust filters or search to see results
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((inv) => (
                        <TableRow
                          key={inv.id}
                          className="transition-colors hover:bg-secondary/50"
                        >
                          <TableCell className="font-medium">
                            {inv.invoice_number ?? inv.id}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(inv.invoice_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="tabular-nums">
                            {inv.currency}{' '}
                            {(inv.amount_due >= 100 ? inv.amount_due / 100 : inv.amount_due).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'rounded-full',
                                STATUS_COLORS[inv.status] ?? 'bg-muted'
                              )}
                            >
                              {inv.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {inv.status === 'paid' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() =>
                                  handleRefundClick({
                                    id: inv.id,
                                    amount_due: inv.amount_due,
                                    status: inv.status,
                                  })
                                }
                              >
                                Refund
                              </Button>
                            )}
                            {inv.pdf_url && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-1 rounded-lg"
                                asChild
                              >
                                <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="mt-0">
          <Card className="rounded-2xl border border-border shadow-card">
            <CardHeader>
              <CardTitle>Billing exceptions</CardTitle>
              <CardDescription>
                Payment failures and exceptions requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!billingExceptions?.length ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-foreground">
                    No billing exceptions
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Exceptions will appear here when payments fail
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Workspace</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billingExceptions.map((ex) => (
                        <TableRow key={ex.id} className="hover:bg-secondary/50">
                          <TableCell className="font-medium">{ex.workspace_id ?? ex.account_id}</TableCell>
                          <TableCell>{ex.reason}</TableCell>
                          <TableCell className="tabular-nums">
                            {ex.currency} {ex.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(ex.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{ex.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Issue refund</DialogTitle>
            <DialogDescription>
              Refund amount for invoice {selectedInvoice?.id}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Amount</Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="0"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="rounded-lg"
              />
              {selectedInvoice && (
                <p className="text-xs text-muted-foreground">
                  Max: {(selectedInvoice.amount / 100).toFixed(2)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="refund-reason">Reason</Label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger id="refund-reason" className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Requested by customer</SelectItem>
                  <SelectItem value="duplicate">Duplicate</SelectItem>
                  <SelectItem value="fraudulent">Fraudulent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefundSubmit}
              disabled={refundMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              {refundMutation.isPending ? 'Processing…' : 'Issue refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
