/**
 * Analytics & Reports - data contracts for studio analytics
 */

export type GroupByOption = 'PROJECT' | 'CLIENT' | 'TEMPLATE'

export interface AnalyticsFilters {
  from: string
  to: string
  groupBy?: GroupByOption[]
  projectIds?: string[]
  clientIds?: string[]
  templateIds?: string[]
}

export interface StudioKpis {
  averageTimeToApprove: number // hours
  pendingDecisions: number
  clientApprovalRate: number // 0-100
  deltaTimeToApprove?: number
  deltaPending?: number
  deltaApprovalRate?: number
}

export interface TimeSeriesPoint {
  date: string
  approvals: number
  pending: number
  avgTimeHours?: number
}

export interface BottleneckStage {
  stage: string
  count: number
  percentage: number
}

export interface TemplatePerformance {
  id: string
  name: string
  usageCount: number
  avgApprovalTimeHours: number
  successRate: number // 0-100
}

export interface ClientResponsiveness {
  clientId: string
  clientName: string
  avgResponseTimeHours: number
  responseRate: number // 0-100
}

export interface StudioAnalyticsResponse {
  kpis: StudioKpis
  timeSeries: TimeSeriesPoint[]
  bottleneckStages: BottleneckStage[]
  templatePerformance: TemplatePerformance[]
  clientResponsiveness: ClientResponsiveness[]
}

export interface DrilldownFilters {
  type: 'bottleneck' | 'pending' | 'approved' | 'overdue'
  from: string
  to: string
  projectIds?: string[]
  clientIds?: string[]
  templateIds?: string[]
  stage?: string
}

export interface DrilldownDecision {
  id: string
  project_id: string
  project_name: string
  title: string
  status: string
  stage?: string
  template_id?: string
  template_name?: string
  client_id?: string
  client_name?: string
  created_at: string
  updated_at: string
  approved_at?: string | null
  response_time_hours?: number
}

export interface DrilldownResponse {
  decisions: DrilldownDecision[]
  total: number
  page: number
  pageSize: number
}

export interface ExportPayload {
  type: 'csv' | 'pdf'
  from: string
  to: string
  groupBy?: GroupByOption[]
  filters?: Record<string, unknown>
}

export interface ExportResponse {
  url: string
  expiresAt?: string
}

export type ReportCadence = 'daily' | 'weekly' | 'monthly'

export interface SchedulePayload {
  format: 'csv' | 'pdf'
  cadence: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  from: string
  to: string
  groupBy?: GroupByOption[]
  filters?: Record<string, unknown>
}
