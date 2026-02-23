import { BillingCard } from '@/components/settings'

export function SettingsBilling() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="mt-1 text-muted-foreground">
          Plan, payment method, and invoices
        </p>
      </div>
      <BillingCard />
    </div>
  )
}
