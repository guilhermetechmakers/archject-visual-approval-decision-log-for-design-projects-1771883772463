/**
 * Settings Privacy Controls - masking rules, data categories, export scope.
 */

import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PrivacyControlsPanel } from '@/components/governance'

export function SettingsPrivacyControls() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Privacy controls</h1>
        <p className="mt-1 text-muted-foreground">
          Data masking, export scope, and access controls for your workspace
        </p>
      </div>

      <PrivacyControlsPanel />

      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Enterprise privacy</CardTitle>
          <CardDescription>
            Admins can configure data masking, PII handling, and data ownership from the Governance dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/admin/governance?tab=privacy"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Open Governance
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
