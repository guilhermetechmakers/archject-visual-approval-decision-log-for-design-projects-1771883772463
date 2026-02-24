import type { LucideIcon } from 'lucide-react'
import { ChevronRight, ListOrdered } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface StepItem {
  title: string
  description: string
  icon: LucideIcon
}

export interface HowItWorksSectionProps {
  steps: StepItem[]
  isLoading?: boolean
  className?: string
}

export function HowItWorksSection({
  steps,
  isLoading = false,
  className,
}: HowItWorksSectionProps) {
  const isEmpty = !isLoading && steps.length === 0

  return (
    <section
      id="how-it-works"
      className={cn('border-t border-border bg-secondary/30 px-4 py-24', className)}
      aria-labelledby="how-it-works-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <h2
          id="how-it-works-heading"
          className="text-center text-3xl font-bold text-foreground md:text-4xl"
        >
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Three simple steps from decision to approval to export.
        </p>
        {isLoading ? (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="mt-2 h-5 w-48" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isEmpty ? (
          <div
            className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center"
            role="status"
            aria-label="No steps available"
          >
            <ListOrdered className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-lg font-medium text-foreground">
              No steps to display
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              How-it-works steps will appear here once they are configured.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
            <div key={step.title} className="relative">
              <Card
                className="h-full transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
                style={{
                  animation: 'fade-in-up 0.4s ease-out forwards',
                  animationDelay: `${i * 100}ms`,
                  opacity: 0,
                }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <step.icon className="h-6 w-6" aria-hidden />
                  </div>
                  <span className="text-muted-foreground text-sm font-medium">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              {i < steps.length - 1 && (
                <div
                  className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 lg:block"
                  aria-hidden
                >
                  <ChevronRight className="h-6 w-6 text-muted-foreground/50" />
                </div>
              )}
            </div>
          ))}
          </div>
        )}
      </div>
    </section>
  )
}
