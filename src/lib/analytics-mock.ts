/**
 * Mock analytics data for development and when API is unavailable
 */

import type {
  StudioAnalyticsResponse,
  DrilldownResponse,
  DrilldownDecision,
} from '@/types/analytics'

function generateTimeSeries(): StudioAnalyticsResponse['timeSeries'] {
  const points: StudioAnalyticsResponse['timeSeries'] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    points.push({
      date: d.toISOString().slice(0, 10),
      approvals: Math.floor(Math.random() * 8) + 2,
      pending: Math.floor(Math.random() * 5) + 1,
      avgTimeHours: Math.floor(Math.random() * 48) + 12,
    })
  }
  return points
}

export const mockStudioAnalytics: StudioAnalyticsResponse = {
  kpis: {
    averageTimeToApprove: 32,
    pendingDecisions: 12,
    clientApprovalRate: 78,
    deltaTimeToApprove: -8,
    deltaPending: 2,
    deltaApprovalRate: 5,
  },
  timeSeries: generateTimeSeries(),
  bottleneckStages: [
    { stage: 'Pending client review', count: 8, percentage: 42 },
    { stage: 'Draft', count: 4, percentage: 21 },
    { stage: 'Awaiting internal review', count: 3, percentage: 16 },
    { stage: 'Revision requested', count: 2, percentage: 11 },
    { stage: 'Approved', count: 2, percentage: 10 },
  ],
  templatePerformance: [
    { id: 't1', name: 'Finishes selection', usageCount: 24, avgApprovalTimeHours: 28, successRate: 85 },
    { id: 't2', name: 'Layout approval', usageCount: 18, avgApprovalTimeHours: 42, successRate: 72 },
    { id: 't3', name: 'Change request', usageCount: 12, avgApprovalTimeHours: 56, successRate: 65 },
    { id: 't4', name: 'Color palette', usageCount: 9, avgApprovalTimeHours: 22, successRate: 92 },
    { id: 't5', name: 'Material spec', usageCount: 6, avgApprovalTimeHours: 38, successRate: 78 },
  ],
  clientResponsiveness: [
    { clientId: 'c1', clientName: 'Riverside Villa Client', avgResponseTimeHours: 24, responseRate: 88 },
    { clientId: 'c2', clientName: 'Urban Loft Corp', avgResponseTimeHours: 48, responseRate: 65 },
    { clientId: 'c3', clientName: 'Garden House Ltd', avgResponseTimeHours: 18, responseRate: 95 },
  ],
}

export const mockDrilldownDecisions: DrilldownDecision[] = [
  {
    id: 'd1',
    project_id: 'p1',
    project_name: 'Riverside Villa',
    title: 'Kitchen finish options',
    status: 'pending',
    stage: 'Pending client review',
    template_id: 't1',
    template_name: 'Finishes selection',
    client_id: 'c1',
    client_name: 'Riverside Villa Client',
    created_at: '2025-02-20T10:00:00Z',
    updated_at: '2025-02-22T14:30:00Z',
    response_time_hours: 52,
  },
  {
    id: 'd2',
    project_id: 'p1',
    project_name: 'Riverside Villa',
    title: 'Bathroom tile selection',
    status: 'pending',
    stage: 'Pending client review',
    template_id: 't1',
    template_name: 'Finishes selection',
    client_id: 'c1',
    client_name: 'Riverside Villa Client',
    created_at: '2025-02-18T09:00:00Z',
    updated_at: '2025-02-23T08:00:00Z',
    response_time_hours: 119,
  },
  {
    id: 'd3',
    project_id: 'p2',
    project_name: 'Urban Loft',
    title: 'Exterior color palette',
    status: 'pending',
    stage: 'Draft',
    template_id: 't4',
    template_name: 'Color palette',
    created_at: '2025-02-22T11:00:00Z',
    updated_at: '2025-02-22T11:00:00Z',
  },
  {
    id: 'd4',
    project_id: 'p1',
    project_name: 'Riverside Villa',
    title: 'Floor plan revision',
    status: 'pending',
    stage: 'Awaiting internal review',
    template_id: 't2',
    template_name: 'Layout approval',
    created_at: '2025-02-21T15:00:00Z',
    updated_at: '2025-02-22T16:00:00Z',
  },
  {
    id: 'd5',
    project_id: 'p3',
    project_name: 'Garden House',
    title: 'Material specification',
    status: 'pending',
    stage: 'Revision requested',
    template_id: 't5',
    template_name: 'Material spec',
    client_id: 'c3',
    client_name: 'Garden House Ltd',
    created_at: '2025-02-19T08:00:00Z',
    updated_at: '2025-02-23T09:00:00Z',
    response_time_hours: 96,
  },
]

export function getMockDrilldown(
  _filters: { type?: string; from?: string; to?: string },
  page = 1,
  pageSize = 25
): DrilldownResponse {
  const start = (page - 1) * pageSize
  const decisions = mockDrilldownDecisions.slice(start, start + pageSize)
  return {
    decisions,
    total: mockDrilldownDecisions.length,
    page,
    pageSize,
  }
}
