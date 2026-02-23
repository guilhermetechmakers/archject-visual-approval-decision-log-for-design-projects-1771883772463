import { Card, CardContent } from '@/components/ui/card'
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
  className?: string
}

export function LogosTestimonials({
  logos,
  testimonials,
  className,
}: LogosTestimonialsProps) {
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

        {/* Logo strip */}
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

        {/* Testimonials */}
        <div className="mt-24 grid gap-8 md:grid-cols-2">
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
      </div>
    </section>
  )
}
