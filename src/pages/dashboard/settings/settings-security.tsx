import { Link } from 'react-router-dom'
import { FileClock, Lock } from 'lucide-react'
import { SecurityCard, PasswordChangeCard, TwoFACard } from '@/components/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SettingsSecurity() {
  return (
    <main
      className="space-y-8"
      role="main"
      aria-label="Security and compliance settings"
    >
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Security & compliance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Password, audit logs, 2FA, retention, and privacy controls
        </p>
      </header>

      <section className="space-y-6" aria-label="Security settings sections">
        <PasswordChangeCard />
        <TwoFACard />
        <SecurityCard />

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileClock className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <CardTitle className="text-base text-foreground">Retention policy</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Configure data retention and archival rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/dashboard/settings/retention-policy"
                  aria-label="View retention policy settings"
                >
                  View policies
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                <CardTitle className="text-base text-foreground">Privacy controls</CardTitle>
              </div>
              <CardDescription className="text-muted-foreground">
                Data masking, PII handling, and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/dashboard/settings/privacy-controls"
                  aria-label="Configure privacy and data protection settings"
                >
                  Configure privacy
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  )
}
