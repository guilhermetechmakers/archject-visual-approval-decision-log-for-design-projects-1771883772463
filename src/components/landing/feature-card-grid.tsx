import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
}

export interface FeatureCardGridProps {
  features: FeatureItem[]
  className?: string
}

export function FeatureCardGrid({ features, className }: FeatureCardGridProps) {
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
      </div>
    </section>
  )
}
