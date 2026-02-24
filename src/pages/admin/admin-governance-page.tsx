/**
 * Admin Governance Page - Security, Privacy & Compliance.
 * Audit logs, data exports, retention policies, privacy controls, compliance status.
 * Uses design tokens, accessible tabs, and loading states per Design Reference.
 */

import { useSearchParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { History, FileArchive, Database, Shield, Activity } from 'lucide-react'
import {
  AuditLogsExplorer,
  DataExportsPanel,
  RetentionPoliciesPanel,
  PrivacyControlsPanel,
  ComplianceStatusCard,
} from '@/components/governance'
import { SystemHealthPanel } from '@/components/admin'
import { useSystemHealth } from '@/hooks/use-governance'
import { Skeleton } from '@/components/ui/skeleton'

const TAB_VALUES = ['audit', 'exports', 'retention', 'privacy', 'health'] as const

export function AdminGovernancePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = (TAB_VALUES.includes(tabParam as (typeof TAB_VALUES)[number]) ? tabParam : 'audit') as (typeof TAB_VALUES)[number]

  const { data: systemHealth, isLoading: healthLoading, isError: healthError } = useSystemHealth()
  const healthData = systemHealth ?? {
    captured_at: new Date().toISOString(),
    uptime_pct: 99.98,
    api_latency_ms: 42,
    errors_last_24h: 3,
    backlog_size: 0,
    redis_health: 'healthy' as const,
  }

  return (
    <div className="space-y-8 animate-fade-in" role="main" aria-label="Security, Privacy and Compliance">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Security, Privacy & Compliance</h1>
        <p className="mt-1 text-muted-foreground">
          Audit logs, data exports, retention policies, and privacy controls
        </p>
      </header>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setSearchParams({ tab: v })}
        className="space-y-6"
        aria-label="Security and compliance sections"
      >
        <TabsList
          className="flex flex-wrap gap-1 rounded-full bg-secondary p-1 h-auto"
          aria-label="Governance navigation tabs"
        >
          <TabsTrigger
            value="audit"
            className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="Audit Logs tab - view and filter audit entries"
          >
            <History className="h-4 w-4" aria-hidden />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger
            value="exports"
            className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="Data Exports tab - manage export jobs"
          >
            <FileArchive className="h-4 w-4" aria-hidden />
            Data Exports
          </TabsTrigger>
          <TabsTrigger
            value="retention"
            className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="Retention Policies tab - configure data retention"
          >
            <Database className="h-4 w-4" aria-hidden />
            Retention Policies
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="Privacy Controls tab - masking and access controls"
          >
            <Shield className="h-4 w-4" aria-hidden />
            Privacy Controls
          </TabsTrigger>
          <TabsTrigger
            value="health"
            className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            aria-label="System Health tab - uptime and latency metrics"
          >
            <Activity className="h-4 w-4" aria-hidden />
            System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AuditLogsExplorer />
            </div>
            <div>
              <ComplianceStatusCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="exports" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <DataExportsPanel />
            </div>
            <div>
              <ComplianceStatusCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="retention" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RetentionPoliciesPanel />
            </div>
            <div>
              <ComplianceStatusCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="privacy" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PrivacyControlsPanel />
            </div>
            <div>
              <ComplianceStatusCard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="health" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            {healthLoading ? (
              <div
                className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-card"
                role="status"
                aria-label="Loading system health"
                aria-busy="true"
              >
                <Skeleton className="h-6 w-32 rounded-lg" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
                <Skeleton className="h-32 w-full rounded-lg" />
              </div>
            ) : healthError ? (
              <div
                className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center shadow-card"
                role="alert"
                aria-label="Failed to load system health"
              >
                <Activity className="h-12 w-12 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-sm font-medium text-foreground">Unable to load system health</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  There was a problem fetching health metrics. Please try again later.
                </p>
              </div>
            ) : (
              <SystemHealthPanel data={healthData} />
            )}
            <ComplianceStatusCard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
