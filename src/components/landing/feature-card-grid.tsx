import type { LucideIcon } from 'lucide-react'
import { LayoutGrid } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
}

export interface FeatureCardGridProps {
  features: FeatureItem[]
  isLoading?: boolean
  className?: string
}

export function FeatureCardGrid({
  features,
  isLoading = false,
  className,
}: FeatureCardGridProps) {
  const isEmpty = !isLoading && features.length === 0

  return (
    <section
      id="features"
      className={cn('px-4 py-24', className)}
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <h2
          id="features-heading"
          className="text-center text-3xl font-bold text-foreground md:text-4xl"
        >
          Built for visual decision-making
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          A focused, auditable approval layer that replaces scattered emails and
          PDFs with structured workflows.
        </p>
        {isLoading ? (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isEmpty ? (
          <div
            className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center"
            role="status"
            aria-label="No features available"
          >
            <LayoutGrid className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-lg font-medium text-foreground">
              No features to display
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Features will appear here once they are configured. Check back
              later.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
            <Card
              key={feature.title}
              className="group transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
              style={{
                animation: 'fade-in-up 0.4s ease-out forwards',
                animationDelay: `${i * 80}ms`,
                opacity: 0,
              }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </section>
  )
}
