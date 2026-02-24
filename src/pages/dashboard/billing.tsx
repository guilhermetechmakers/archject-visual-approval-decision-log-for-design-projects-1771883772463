import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Settings, ArrowRight, CreditCard, FileText, Package, History, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  CurrentPlanCard,
  PlanChangeModal,
  PaymentMethodSection,
  InvoicesTable,
  AddOnsSection,
  ExportButton,
  RecentInvoicesCard,
} from '@/components/billing'
import { useExportBilling, useBillingSubscription } from '@/hooks/use-billing'
import { toast } from 'sonner'

export function BillingPage() {
  const [planModalOpen, setPlanModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const exportBilling = useExportBilling()
  const { data: subscription, isLoading, isError, error } = useBillingSubscription()
  const isExporting = exportBilling.isPending

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const result = await exportBilling.mutateAsync(format)
      if (result?.download_url) {
        window.open(result.download_url, '_blank')
        toast.success('Billing data exported successfully')
      } else {
        toast.success('Export initiated. Download will start when backend is configured.')
      }
    } catch {
      // Error feedback handled by useExportBilling's onError (toast.error)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">
            Billing & subscription
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your plan, payment methods, invoices, and add-ons
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/billing/history" aria-label="View transaction history">
              <History className="h-4 w-4" aria-hidden />
              Transaction history
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            aria-label={isExporting ? 'Exporting billing data as PDF' : 'Export billing data as PDF'}
            aria-busy={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={isExporting}
            aria-label={isExporting ? 'Exporting billing data as CSV' : 'Export billing data as CSV'}
            aria-busy={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            Export CSV
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/settings/billing" aria-label="Open billing settings">
              <Settings className="h-4 w-4" aria-hidden />
              Settings
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {isError && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden />
          <AlertTitle>Unable to load billing data</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Something went wrong. Please try again later.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" aria-label="Billing sections">
        <TabsList
          className="inline-flex h-10 items-center justify-center rounded-pill bg-secondary p-1"
          aria-label="Billing sections"
        >
          <TabsTrigger
            value="overview"
            className="rounded-pill px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="View billing overview"
          >
            <CreditCard className="h-4 w-4 sm:mr-2" aria-hidden />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="rounded-pill px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="View invoice history"
          >
            <FileText className="h-4 w-4 sm:mr-2" aria-hidden />
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="addons"
            className="rounded-pill px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="View add-ons"
          >
            <Package className="h-4 w-4 sm:mr-2" aria-hidden />
            Add-ons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          {isLoading ? (
            <div className="space-y-6" role="status" aria-live="polite" aria-label="Loading billing overview">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : (
            <>
              <CurrentPlanCard onChangePlan={() => setPlanModalOpen(true)} />
              <PaymentMethodSection />
              <RecentInvoicesCard onViewAll={() => setActiveTab('invoices')} />
            </>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="mt-0 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Invoice history</h2>
              <p className="text-sm text-muted-foreground">
                View, search, and download all your invoices
              </p>
            </div>
            <ExportButton aria-label="Export invoice history" />
          </div>
          <InvoicesTable />
        </TabsContent>

        <TabsContent value="addons" className="mt-0">
          <AddOnsSection />
        </TabsContent>
      </Tabs>

      <PlanChangeModal
        open={planModalOpen}
        onOpenChange={setPlanModalOpen}
        currentPlanId={subscription?.plan?.id}
        subscription={subscription ?? null}
      />
    </div>
  )
}
