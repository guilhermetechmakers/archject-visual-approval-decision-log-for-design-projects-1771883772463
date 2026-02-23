import { HelpCircle, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SupportCtaProps {
  onContactBilling?: () => void
}

export function SupportCta({ onContactBilling }: SupportCtaProps) {
  const handleContact = () => {
    if (onContactBilling) {
      onContactBilling()
    } else {
      window.location.href = 'mailto:billing@archject.com?subject=Billing%20inquiry'
    }
  }

  return (
    <Card className="rounded-2xl border border-border bg-gradient-to-br from-secondary/50 to-background shadow-card">
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Need help disputing a charge?
            </p>
            <p className="text-sm text-muted-foreground">
              Contact our billing team for assistance with disputes, refunds, or
              payment issues.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0 rounded-lg border-primary/30 text-primary hover:bg-primary/10"
          onClick={handleContact}
          aria-label="Contact billing support"
        >
          <Mail className="h-4 w-4" />
          Contact Billing
        </Button>
      </CardContent>
    </Card>
  )
}
