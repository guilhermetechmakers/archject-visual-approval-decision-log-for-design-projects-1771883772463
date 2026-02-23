/**
 * Checkout form validation schemas
 */

import { z } from 'zod'

export const billingAddressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postal_code: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

export const billingInfoSchema = z.object({
  company: z.string().optional(),
  vat_tax_id: z.string().optional(),
  address: billingAddressSchema,
  email: z.string().email('Valid email is required'),
})

export type BillingInfoFormValues = z.infer<typeof billingInfoSchema>
