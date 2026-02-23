import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CTAConfig {
  label: string
  href: string
}

export interface HeroBlockProps {
  title: React.ReactNode
  subtitle: string
  ctaPrimary: CTAConfig
  ctaSecondary: CTAConfig
  media?: {
    type: 'image' | 'video'
    src: string
    alt?: string
  }
  className?: string
}

export function HeroBlock({
  title,
  subtitle,
  ctaPrimary,
  ctaSecondary,
  media,
  className,
}: HeroBlockProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden px-4 py-24 md:py-32 lg:py-40',
        className
      )}
      aria-labelledby="hero-title"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 animate-[fade-in_0.6s_ease-out]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(25,92,74,0.08),transparent)]" />

      <div className="container relative mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div className="mx-auto max-w-2xl text-center lg:text-left">
            <h1
              id="hero-title"
              className="text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl xl:text-[72px] xl:leading-[1.1]"
            >
              {title}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed">
              {subtitle}
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link to={ctaPrimary.href}>
                <Button
                  size="lg"
                  className="w-full min-w-[160px] sm:w-auto transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  aria-label={ctaPrimary.label}
                >
                  {ctaPrimary.label}
                </Button>
              </Link>
              <Link to={ctaSecondary.href}>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full min-w-[160px] sm:w-auto transition-all duration-200 hover:scale-[1.02] hover:bg-muted active:scale-[0.98]"
                  aria-label={ctaSecondary.label}
                >
                  {ctaSecondary.label}
                </Button>
              </Link>
            </div>
          </div>

          {media && (
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              <div className="rounded-2xl border border-border bg-card p-2 shadow-card overflow-hidden">
                {media.type === 'image' ? (
                  <img
                    src={media.src}
                    alt={media.alt ?? 'Product preview'}
                    className="w-full h-auto rounded-xl object-cover"
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={media.src}
                    className="w-full h-auto rounded-xl object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    aria-label={media.alt ?? 'Product demo'}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
