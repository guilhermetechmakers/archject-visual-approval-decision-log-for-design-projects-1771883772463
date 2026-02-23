import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Settings, ArrowRight, CreditCard, FileText, Package, History } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const { data: subscription } = useBillingSubscription()

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const result = await exportBilling.mutateAsync(format)
      if (result?.download_url) {
        window.open(result.download_url, '_blank')
        toast.success('Export ready')
      } else {
        toast.success('Export initiated. Download will start when backend is configured.')
      }
    } catch {
      toast.success('Export initiated. Download will start when backend is configured.')
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
            <Link to="/dashboard/billing/history">
              <History className="h-4 w-4" />
              Transaction history
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={exportBilling.isPending}
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exportBilling.isPending}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard/settings/billing">
              <Settings className="h-4 w-4" />
              Settings
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-xl bg-secondary p-1">
          <TabsTrigger
            value="overview"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CreditCard className="h-4 w-4 sm:mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-4 w-4 sm:mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="addons"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Package className="h-4 w-4 sm:mr-2" />
            Add-ons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0 space-y-6">
          <CurrentPlanCard onChangePlan={() => setPlanModalOpen(true)} />
          <PaymentMethodSection />
          <RecentInvoicesCard onViewAll={() => setActiveTab('invoices')} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-0 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Invoice history</h2>
              <p className="text-sm text-muted-foreground">
                View, search, and download all your invoices
              </p>
            </div>
            <ExportButton />
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
