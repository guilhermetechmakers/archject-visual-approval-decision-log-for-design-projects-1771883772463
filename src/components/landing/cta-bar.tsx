import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface CTABarProps {
  title?: string
  subtitle?: string
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  sticky?: boolean
  className?: string
}

const defaultPrimary = { label: 'Start free', href: '/signup' }
const defaultSecondary = { label: 'Request demo', href: '/demo-request' }

export function CTABar({
  title = 'Ready to streamline approvals?',
  subtitle = 'Join architecture and design studios using Archject for faster approvals and defensible records.',
  primaryCta = defaultPrimary,
  secondaryCta = defaultSecondary,
  sticky = false,
  className,
}: CTABarProps) {
  return (
    <section
      className={cn(
        'border-t border-border bg-secondary/30 px-4 py-24',
        sticky && 'sticky bottom-0 z-40',
        className
      )}
      aria-labelledby="cta-bar-title"
    >
      <div className="container mx-auto max-w-3xl text-center">
        <h2
          id="cta-bar-title"
          className="text-3xl font-bold text-foreground md:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-4 text-muted-foreground">{subtitle}</p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link to={primaryCta.href}>
            <Button
              size="lg"
              className="w-full min-w-[160px] sm:w-auto transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              aria-label={primaryCta.label}
            >
              {primaryCta.label}
            </Button>
          </Link>
          <Link to={secondaryCta.href}>
            <Button
              variant="outline"
              size="lg"
              className="w-full min-w-[160px] sm:w-auto transition-all duration-200 hover:scale-[1.02] hover:bg-muted active:scale-[0.98]"
              aria-label={secondaryCta.label}
            >
              {secondaryCta.label}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
