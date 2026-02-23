import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function BillingPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Billing & subscription</h1>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Manage your subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-semibold">Starter</p>
              <p className="text-sm text-muted-foreground">
                5 projects, 50 decisions/month
              </p>
            </div>
            <Badge>Active</Badge>
          </div>
          <Button className="mt-4">Change plan</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>Update your payment details</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">•••• •••• •••• 4242</p>
          <Button variant="outline" className="mt-4">Update payment method</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>No invoices yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
