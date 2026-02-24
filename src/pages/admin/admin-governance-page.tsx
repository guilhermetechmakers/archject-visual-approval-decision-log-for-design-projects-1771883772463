/**
 * Admin Governance Page - Security, Privacy & Compliance.
 * Audit logs, data exports, retention policies, privacy controls, compliance status.
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

  const { data: systemHealth, isLoading: healthLoading } = useSystemHealth()
  const healthData = systemHealth ?? {
    captured_at: new Date().toISOString(),
    uptime_pct: 99.98,
    api_latency_ms: 42,
    errors_last_24h: 3,
    backlog_size: 0,
    redis_health: 'healthy' as const,
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security, Privacy & Compliance</h1>
        <p className="mt-1 text-muted-foreground">
          Audit logs, data exports, retention policies, and privacy controls
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setSearchParams({ tab: v })} className="space-y-6">
        <TabsList className="flex flex-wrap gap-1 rounded-full bg-secondary p-1 h-auto">
          <TabsTrigger value="audit" className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="exports" className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileArchive className="h-4 w-4" />
            Data Exports
          </TabsTrigger>
          <TabsTrigger value="retention" className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Database className="h-4 w-4" />
            Retention Policies
          </TabsTrigger>
          <TabsTrigger value="privacy" className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Shield className="h-4 w-4" />
            Privacy Controls
          </TabsTrigger>
          <TabsTrigger value="health" className="rounded-full gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Activity className="h-4 w-4" />
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
              <Skeleton className="h-64 rounded-xl" />
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
