/**
 * Dashboard data contracts - ready for API integration
 */

export interface DashboardUser {
  id: string
  name: string
  avatar?: string | null
}

export interface WorkspaceBranding {
  logo?: string | null
  primaryColor?: string | null
}

export interface DashboardWorkspace {
  id: string
  name: string
  branding?: WorkspaceBranding | null
}

export interface DashboardProject {
  id: string
  name: string
  progress: number
  last_activity: string
  active_decisions_count: number
  branding?: { thumbnail?: string | null } | null
}

export interface AwaitingApproval {
  decision_id: string
  title: string
  project_id: string
  project_name?: string
  due_date: string
  client_email?: string | null
  client_name?: string | null
  share_link?: string | null
  status: 'pending' | 'overdue'
  /** ISO date string - when client last responded or decision was last updated */
  last_updated_at?: string | null
}

export type ActivityType =
  | 'approval'
  | 'comment'
  | 'upload'
  | 'status_change'
  | 'decision_created'
  | 'link_shared'

export interface RecentActivity {
  id: string
  type: ActivityType
  timestamp: string
  summary: string
  actor?: string | null
  project_id?: string | null
  decision_id?: string | null
}

export interface UsageSnapshot {
  projects_count: number
  decisions_count: number
  files_count: number
  storage_used: number
  storage_quota: number
}

/** Dashboard KPI strip - key metrics for user-specific dashboard */
export interface DashboardKpis {
  activeProjects: number
  decisionsAwaitingClient: number
  averageDecisionDurationHours: number
  templateAdoptionRate: number // 0-100
  deltaActiveProjects?: number
  deltaAwaitingClient?: number
  deltaDecisionDuration?: number
  deltaTemplateAdoption?: number
}

/** Trend data for 7/30/90-day views */
export interface DashboardTrendPoint {
  decisionsCreated: number
  decisionsResponded: number
  templatesUsed: number
}

export interface DashboardTrendData {
  last7Days: DashboardTrendPoint
  last30Days: DashboardTrendPoint
  last90Days: DashboardTrendPoint
}

export interface DashboardPayload {
  user: DashboardUser
  workspace: DashboardWorkspace
  projects: DashboardProject[]
  awaiting_approvals: AwaitingApproval[]
  recent_activity: RecentActivity[]
  usage: UsageSnapshot
  kpis?: DashboardKpis
  trendData?: DashboardTrendData
}

export interface WorkspaceOption {
  id: string
  name: string
}
