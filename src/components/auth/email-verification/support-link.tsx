import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SupportLinkProps {
  /** Support email or contact URL */
  supportContact?: string
  /** Prefilled subject for mailto */
  subject?: string
  /** Prefilled body for mailto */
  body?: string
  /** Display label */
  label?: string
  className?: string
}

/**
 * Opens support channel (mailto) with prefilled context.
 */
export function SupportLink({
  supportContact = 'support@archject.com',
  subject = 'Email verification help',
  body = 'I need assistance with email verification.',
  label = 'Contact Support',
  className,
}: SupportLinkProps) {
  const mailtoParams = new URLSearchParams()
  if (subject) mailtoParams.set('subject', subject)
  if (body) mailtoParams.set('body', body)
  const mailto = `mailto:${supportContact}?${mailtoParams.toString()}`

  return (
    <a
      href={mailto}
      className={cn(
        'inline-flex items-center gap-2 text-sm text-primary hover:underline',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
        className
      )}
      aria-label={label}
    >
      <HelpCircle className="h-4 w-4" />
      {label}
    </a>
  )
}
