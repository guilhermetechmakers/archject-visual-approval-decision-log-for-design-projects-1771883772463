/**
 * Settings Retention Policy - per-workspace retention, auto-archive, legal hold.
 */

import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RetentionPoliciesPanel } from '@/components/governance'

export function SettingsRetentionPolicy() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Retention policy
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure data retention duration, auto-archive rules, and legal hold
        </p>
      </header>

      <section aria-labelledby="retention-policies-heading">
        <h2
          id="retention-policies-heading"
          className="sr-only"
        >
          Workspace retention policies
        </h2>
        <RetentionPoliciesPanel />
      </section>

      <section aria-labelledby="governance-heading">
        <h2
          id="governance-heading"
          className="sr-only"
        >
          Governance dashboard
        </h2>
        <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
          <CardHeader>
            <CardTitle className="text-base">Need more control?</CardTitle>
            <CardDescription>
              Admins can manage retention policies across all workspaces from the Governance dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/admin/governance?tab=retention"
              className="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 text-sm font-medium text-primary transition-transform duration-200 hover:scale-[1.02] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
            >
              Open Governance
              <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
