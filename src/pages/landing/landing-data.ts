import {
  LayoutGrid,
  Link2,
  FileCheck,
  Download,
  FileCheck as CreateIcon,
  Share2,
} from 'lucide-react'
import type { FeatureItem } from '@/components/landing/feature-card-grid'
import type { StepItem } from '@/components/landing/how-it-works-section'
import type { TemplateItem } from '@/components/landing/templates-gallery'
import type { PricingTier } from '@/components/landing/pricing-preview'
import type { TestimonialItem } from '@/components/landing/logos-testimonials'

export const heroConfig = {
  title: 'Visual approval & decision log for design projects',
  titleHighlight: 'design projects',
  subtitle:
    'Replace scattered emails and PDFs with a structured, time-stamped workflow. Create decisions, share branded no-login links, and export defensible audit records.',
  ctaPrimary: { label: 'Start free', href: '/signup' },
  ctaSecondary: { label: 'Request demo', href: '/demo-request' },
}

export const features: FeatureItem[] = [
  {
    icon: LayoutGrid,
    title: 'Visual Decisions',
    description:
      'Side-by-side comparison with uploads. Clients see options clearly on mobile and desktop.',
  },
  {
    icon: Link2,
    title: 'Client Links',
    description:
      'Branded no-login links. Zero friction for clients — optional OTP capture for audit.',
  },
  {
    icon: FileCheck,
    title: 'Audit Trail',
    description:
      'Timestamped approvals. Every decision logged with who approved what and when.',
  },
  {
    icon: Download,
    title: 'Exports',
    description:
      'Decision Logs in PDF, CSV, JSON. Defensible records for contracts and compliance.',
  },
]

export const howItWorksSteps: StepItem[] = [
  {
    icon: CreateIcon,
    title: 'Create decision',
    description:
      'Add options, upload visuals, set approvers and due dates. Use templates for common design choices.',
  },
  {
    icon: Share2,
    title: 'Share link',
    description:
      'Clients review via no-login links. Side-by-side comparison on mobile and desktop.',
  },
  {
    icon: FileCheck,
    title: 'Client approves',
    description:
      'Timestamped approvals captured. Optional OTP for verification.',
  },
  {
    icon: Download,
    title: 'Export',
    description:
      'Exportable Decision Logs (PDF/CSV/JSON) for contracts and compliance.',
  },
]

export const templates: TemplateItem[] = [
  {
    id: 'finishes',
    name: 'Finishes & materials',
    description:
      'Compare material samples, finishes, and color options. Perfect for interior and exterior specifications.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1615873968403-89e068629df8?w=600&h=400&fit=crop',
  },
  {
    id: 'layout',
    name: 'Layout options',
    description:
      'Side-by-side layout comparisons. Floor plans, elevations, and spatial arrangements.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&h=400&fit=crop',
  },
  {
    id: 'change-requests',
    name: 'Change requests',
    description:
      'Track and approve design changes. RFIs, substitutions, and revision approvals.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop',
  },
]

export const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    features: [
      '5 projects',
      '50 decisions/month',
      'Client portal links',
      'PDF export',
    ],
    cta: { label: 'Start free', href: '/signup' },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: [
      'Unlimited projects',
      'Unlimited decisions',
      'Team collaboration',
      'CSV & JSON export',
      'Priority support',
    ],
    cta: { label: 'View plans', href: '/signup' },
    recommended: true,
  },
  {
    id: 'team',
    name: 'Team',
    price: 'Custom',
    period: '',
    features: [
      'Everything in Pro',
      'SSO & advanced security',
      'Dedicated success manager',
      'Custom integrations',
    ],
    cta: { label: 'Contact sales', href: '/demo-request' },
  },
]

export const testimonials: TestimonialItem[] = [
  {
    id: '1',
    text: 'Archject cut our approval cycles in half. Clients love the no-login experience, and we have a clear audit trail for every decision.',
    author: 'Sarah Chen',
    company: 'Chen & Partners Architecture',
    caseStudyUrl: '#',
  },
  {
    id: '2',
    text: 'Finally, a tool that understands design workflows. The templates for finishes and layouts saved us countless hours.',
    author: 'Marcus Webb',
    company: 'Webb Design Studio',
    caseStudyUrl: '#',
  },
]

// Placeholder logo URLs - replace with actual customer logos
export const customerLogos = [
  'https://placehold.co/120x40/e6e8f0/6b7280?text=Studio+A',
  'https://placehold.co/120x40/e6e8f0/6b7280?text=Design+B',
  'https://placehold.co/120x40/e6e8f0/6b7280?text=Arch+Co',
  'https://placehold.co/120x40/e6e8f0/6b7280?text=Studio+C',
  'https://placehold.co/120x40/e6e8f0/6b7280?text=Partners',
]
