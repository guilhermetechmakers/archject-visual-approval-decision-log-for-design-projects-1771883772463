/**
 * Mock dashboard data for development and when API is unavailable
 */

import type {
  DashboardPayload,
  WorkspaceOption,
} from '@/types/dashboard'

export const mockWorkspaces: WorkspaceOption[] = [
  { id: 'ws-1', name: 'Riverside Studio' },
  { id: 'ws-2', name: 'Urban Design Co' },
]

export const mockDashboardPayload: DashboardPayload = {
  user: {
    id: 'user-1',
    name: 'Alex Designer',
    avatar: null,
  },
  workspace: {
    id: 'ws-1',
    name: 'Riverside Studio',
    branding: { logo: null, primaryColor: null },
  },
  projects: [
    {
      id: 'p-1',
      name: 'Riverside Villa',
      progress: 65,
      last_activity: '2025-02-23T10:30:00Z',
      active_decisions_count: 3,
      branding: { thumbnail: null },
    },
    {
      id: 'p-2',
      name: 'Urban Loft',
      progress: 40,
      last_activity: '2025-02-22T14:20:00Z',
      active_decisions_count: 1,
      branding: { thumbnail: null },
    },
    {
      id: 'p-3',
      name: 'Garden House',
      progress: 85,
      last_activity: '2025-02-23T08:15:00Z',
      active_decisions_count: 4,
      branding: { thumbnail: null },
    },
  ],
  awaiting_approvals: [
    {
      decision_id: 'd-1',
      title: 'Kitchen finish options',
      project_id: 'p-1',
      project_name: 'Riverside Villa',
      due_date: '2025-02-25',
      client_email: 'client@example.com',
      share_link: 'https://archject.app/portal/abc123',
      status: 'pending',
    },
    {
      decision_id: 'd-2',
      title: 'Bathroom tile selection',
      project_id: 'p-1',
      project_name: 'Riverside Villa',
      due_date: '2025-02-20',
      client_email: 'client@example.com',
      share_link: 'https://archject.app/portal/def456',
      status: 'overdue',
    },
    {
      decision_id: 'd-3',
      title: 'Exterior color palette',
      project_id: 'p-2',
      project_name: 'Urban Loft',
      due_date: '2025-03-01',
      client_email: null,
      share_link: null,
      status: 'pending',
    },
  ],
  recent_activity: [
    {
      id: 'a-1',
      type: 'approval',
      timestamp: '2025-02-23T10:30:00Z',
      summary: 'Client approved Kitchen finish options',
      actor: 'Client',
      project_id: 'p-1',
    },
    {
      id: 'a-2',
      type: 'decision_created',
      timestamp: '2025-02-23T09:15:00Z',
      summary: 'New decision created: Bathroom tile selection',
      actor: 'Alex Designer',
      project_id: 'p-1',
    },
    {
      id: 'a-3',
      type: 'upload',
      timestamp: '2025-02-22T16:45:00Z',
      summary: 'Drawing uploaded to Exterior color palette',
      actor: 'Alex Designer',
      project_id: 'p-2',
    },
    {
      id: 'a-4',
      type: 'comment',
      timestamp: '2025-02-22T14:20:00Z',
      summary: 'Comment added on Kitchen finish options',
      actor: 'Client',
      project_id: 'p-1',
    },
    {
      id: 'a-5',
      type: 'status_change',
      timestamp: '2025-02-23T08:15:00Z',
      summary: 'Garden House status updated',
      actor: 'Alex Designer',
      project_id: 'p-3',
    },
  ],
  usage: {
    projects_count: 12,
    decisions_count: 47,
    files_count: 128,
    storage_used: 2.4,
    storage_quota: 10,
  },
}
