import { HeroBlock } from '@/components/landing/hero-block'
import { FeatureCardGrid } from '@/components/landing/feature-card-grid'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { TemplatesGallery } from '@/components/landing/templates-gallery'
import { PricingPreview } from '@/components/landing/pricing-preview'
import { LogosTestimonials } from '@/components/landing/logos-testimonials'
import { CTABar } from '@/components/landing/cta-bar'
import { Footer } from '@/components/landing/footer'
import { NavigationHeader } from '@/components/layout/navigation-header'
import {
  heroConfig,
  features,
  howItWorksSteps,
  templates,
  pricingTiers,
  testimonials,
  customerLogos,
} from './landing-data'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader />
      <main>
        <HeroBlock
          title={
            <>
              Visual approval & decision log for{' '}
              <span className="text-primary">{heroConfig.titleHighlight}</span>
            </>
          }
          subtitle={heroConfig.subtitle}
          ctaPrimary={heroConfig.ctaPrimary}
          ctaSecondary={heroConfig.ctaSecondary}
        />
        <FeatureCardGrid features={features} />
        <HowItWorksSection steps={howItWorksSteps} />
        <TemplatesGallery templates={templates} />
        <PricingPreview tiers={pricingTiers} />
        <LogosTestimonials logos={customerLogos} testimonials={testimonials} />
        <CTABar />
      </main>
      <Footer />
    </div>
  )
}
