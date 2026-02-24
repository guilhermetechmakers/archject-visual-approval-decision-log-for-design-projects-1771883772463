import { Link } from 'react-router-dom'
import { FileClock, Lock } from 'lucide-react'
import { SecurityCard, PasswordChangeCard, TwoFACard } from '@/components/settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function SettingsSecurity() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security & compliance</h1>
        <p className="mt-1 text-muted-foreground">
          Password, audit logs, 2FA, retention, and privacy controls
        </p>
      </div>
      <div className="space-y-6">
        <PasswordChangeCard />
        <TwoFACard />
        <SecurityCard />
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileClock className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Retention policy</CardTitle>
              </div>
              <CardDescription>
                Configure data retention and archival rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/settings/retention-policy">View policies</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Privacy controls</CardTitle>
              </div>
              <CardDescription>
                Data masking, PII handling, and access controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/settings/privacy-controls">Configure privacy</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
