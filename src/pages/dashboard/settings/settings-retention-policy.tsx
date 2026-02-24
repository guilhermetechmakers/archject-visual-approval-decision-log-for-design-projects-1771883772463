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
      <div>
        <h1 className="text-2xl font-bold text-foreground">Retention policy</h1>
        <p className="mt-1 text-muted-foreground">
          Configure data retention duration, auto-archive rules, and legal hold
        </p>
      </div>

      <RetentionPoliciesPanel />

      <Card className="rounded-xl border border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-base">Need more control?</CardTitle>
          <CardDescription>
            Admins can manage retention policies across all workspaces from the Governance dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            to="/admin/governance?tab=retention"
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
