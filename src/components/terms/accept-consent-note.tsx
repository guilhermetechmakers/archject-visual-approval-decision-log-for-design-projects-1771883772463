import { Link } from 'react-router-dom'

export function AcceptConsentNote() {
  return (
    <aside
      className="rounded-xl border border-border bg-muted/20 p-4"
      aria-label="Consent information"
    >
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">Consent:</strong> By creating an
        account, you indicate your acceptance of these Terms of Service. Consent
        is captured during the signup flow. If you have questions about how we
        handle your consent, please contact{' '}
        <a
          href="mailto:legal@archject.com"
          className="text-primary underline underline-offset-4 hover:text-primary/90"
        >
          legal@archject.com
        </a>
        .
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        New users can review our{' '}
        <Link to="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </Link>{' '}
        and{' '}
        <Link to="/cookies" className="text-primary hover:underline">
          Cookie Policy
        </Link>{' '}
        for additional information.
      </p>
    </aside>
  )
}
