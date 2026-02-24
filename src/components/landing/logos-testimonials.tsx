import { Quote } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface TestimonialItem {
  id: string
  text: string
  author: string
  company?: string
  caseStudyUrl?: string
}

export interface LogosTestimonialsProps {
  logos: string[]
  testimonials: TestimonialItem[]
  isLoading?: boolean
  className?: string
}

export function LogosTestimonials({
  logos,
  testimonials,
  isLoading = false,
  className,
}: LogosTestimonialsProps) {
  const hasLogos = logos.length > 0
  const hasTestimonials = testimonials.length > 0
  const isEmpty = !isLoading && !hasLogos && !hasTestimonials

  return (
    <section
      id="testimonials"
      className={cn('px-4 py-24', className)}
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <h2
          id="testimonials-heading"
          className="text-center text-3xl font-bold text-foreground md:text-4xl"
        >
          Trusted by design studios
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Architecture and design studios use Archject for faster approvals and
          defensible records.
        </p>

        {isLoading ? (
          <>
            <div className="mt-16 flex justify-center gap-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-[120px]" />
              ))}
            </div>
            <div className="mt-24 grid gap-8 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-48" />
                    <Skeleton className="mt-4 h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : isEmpty ? (
          <div
            className="mt-16 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-8 py-16 text-center"
            role="status"
            aria-label="No testimonials or logos available"
          >
            <Quote className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-lg font-medium text-foreground">
              No testimonials yet
            </p>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Customer logos and testimonials will appear here once they are
              added. Be the first to share your experience.
            </p>
          </div>
        ) : (
          <>
            {/* Logo strip */}
            {hasLogos && (
              <div className="mt-16 overflow-hidden">
                <div className="flex animate-[marquee_30s_linear_infinite] gap-16">
                  {[...logos, ...logos].map((logo, i) => (
                    <div
                      key={i}
                      className="flex h-12 shrink-0 items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all"
                    >
                      <img
                        src={logo}
                        alt=""
                        className="h-8 max-w-[120px] object-contain"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {hasTestimonials ? (
              <div className={cn('grid gap-8 md:grid-cols-2', hasLogos && 'mt-24')}>
                {testimonials.map((t, i) => (
            <Card
              key={t.id}
              className="transition-all duration-300 hover:shadow-card-hover"
              style={{
                animation: 'fade-in-up 0.4s ease-out forwards',
                animationDelay: `${i * 100}ms`,
                opacity: 0,
              }}
            >
              <CardContent className="p-6">
                <blockquote className="text-muted-foreground leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </blockquote>
                <footer className="mt-4">
                  <cite className="not-italic font-medium text-foreground">
                    {t.author}
                  </cite>
                  {t.company && (
                    <span className="text-muted-foreground"> — {t.company}</span>
                  )}
                </footer>
                {t.caseStudyUrl && (
                  <a
                    href={t.caseStudyUrl}
                    className="mt-2 inline-block text-sm text-primary hover:underline"
                  >
                    Read case study →
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
              </div>
            ) : hasLogos ? (
              <div
                className="mt-24 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-8 py-12 text-center"
                role="status"
                aria-label="No testimonials available"
              >
                <Quote className="h-10 w-10 text-muted-foreground" aria-hidden />
                <p className="mt-3 text-base font-medium text-foreground">
                  No testimonials yet
                </p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Testimonials will appear here once customers share their
                  experience.
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}
