import { Link } from 'react-router-dom'
import { Check, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface PricingTier {
  id: string
  name: string
  price: string
  period?: string
  features: string[]
  cta: { label: string; href: string }
  recommended?: boolean
}

export interface PricingPreviewProps {
  tiers: PricingTier[]
  isLoading?: boolean
  className?: string
}

export function PricingPreview({
  tiers,
  isLoading = false,
  className,
}: PricingPreviewProps) {
  const isEmpty = !isLoading && tiers.length === 0

  return (
    <section
      id="pricing"
      className={cn('border-t border-border bg-secondary/30 px-4 py-24', className)}
      aria-labelledby="pricing-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <h2
          id="pricing-heading"
          className="text-center text-3xl font-bold text-foreground md:text-4xl"
        >
          Simple, transparent pricing
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Start free. Scale as your studio grows.
        </p>
        {isLoading ? (
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="mt-2 h-8 w-20" />
                </CardHeader>
                <CardContent className="space-y-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-10 w-full rounded-md" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : isEmpty ? (
          <div
            className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center"
            role="status"
            aria-label="No pricing tiers available"
          >
            <CreditCard className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-lg font-medium text-foreground">
              No pricing plans yet
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Pricing tiers will appear here once they are configured. Contact
              us for custom plans.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier, i) => (
            <Card
              key={tier.id}
              className={cn(
                'relative flex flex-col transition-all duration-300 hover:shadow-card-hover',
                tier.recommended && 'ring-2 ring-primary shadow-lg'
              )}
              style={{
                animation: 'fade-in-up 0.4s ease-out forwards',
                animationDelay: `${i * 80}ms`,
                opacity: 0,
              }}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Recommended
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-muted-foreground"> {tier.period}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Link to={tier.cta.href} className="w-full">
                  <Button
                    variant={tier.recommended ? 'default' : 'outline'}
                    className="w-full"
                  >
                    {tier.cta.label}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
          </div>
        )}
      </div>
    </section>
  )
}
