import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, MapPin, Mail } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const billingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

const billingInfoSchema = z.object({
  company: z.string().optional(),
  vat_tax_id: z.string().optional(),
  email: z.string().email('Valid email is required'),
  address: billingAddressSchema,
})

export type BillingInfoFormValues = z.infer<typeof billingInfoSchema>

export interface BillingInfoFormHandle {
  getValues: () => BillingInfoFormValues
  validate: () => Promise<boolean>
}

interface BillingInfoFormProps {
  defaultValues?: Partial<BillingInfoFormValues>
  onSubmit?: (data: BillingInfoFormValues) => void
  className?: string
}

export const BillingInfoForm = React.forwardRef<BillingInfoFormHandle, BillingInfoFormProps>(
  function BillingInfoForm({ defaultValues, onSubmit, className }, ref) {
  const form = useForm<BillingInfoFormValues>({
    resolver: zodResolver(billingInfoSchema),
    defaultValues: {
      company: '',
      vat_tax_id: '',
      email: '',
      address: {
        name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
      },
      ...defaultValues,
    },
  })

  React.useImperativeHandle(ref, () => ({
    getValues: () => form.getValues(),
    validate: () => form.trigger(),
  }))

  return (
    <form onSubmit={onSubmit ? form.handleSubmit(onSubmit) : (e) => e.preventDefault()}>
      <Card
        className={cn(
          'rounded-2xl border border-border bg-card shadow-card transition-all duration-200',
          className
        )}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">Billing information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company (optional)</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="company"
                  placeholder="Acme Inc."
                  className="pl-9"
                  {...form.register('company')}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat_tax_id">VAT / Tax ID (optional)</Label>
              <Input
                id="vat_tax_id"
                placeholder="GB123456789"
                {...form.register('vat_tax_id')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email for receipts</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="billing@company.com"
                className="pl-9"
                {...form.register('email')}
              />
            </div>
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-4 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Billing address</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address.name">Full name</Label>
                <Input
                  id="address.name"
                  placeholder="John Doe"
                  {...form.register('address.name')}
                />
                {form.formState.errors.address?.name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.name.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address.line1">Address line 1</Label>
                <Input
                  id="address.line1"
                  placeholder="123 Main St"
                  {...form.register('address.line1')}
                />
                {form.formState.errors.address?.line1 && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.line1.message}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address.line2">Address line 2 (optional)</Label>
                <Input
                  id="address.line2"
                  placeholder="Suite 100"
                  {...form.register('address.line2')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.city">City</Label>
                <Input
                  id="address.city"
                  placeholder="San Francisco"
                  {...form.register('address.city')}
                />
                {form.formState.errors.address?.city && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.city.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.state">State / Region</Label>
                <Input
                  id="address.state"
                  placeholder="CA"
                  {...form.register('address.state')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.postal_code">Postal code</Label>
                <Input
                  id="address.postal_code"
                  placeholder="94102"
                  {...form.register('address.postal_code')}
                />
                {form.formState.errors.address?.postal_code && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.postal_code.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address.country">Country</Label>
                <Input
                  id="address.country"
                  placeholder="United States"
                  {...form.register('address.country')}
                />
                {form.formState.errors.address?.country && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.address.country.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  )
})
