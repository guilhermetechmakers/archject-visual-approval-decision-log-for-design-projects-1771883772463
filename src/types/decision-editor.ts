/**
 * Decision Editor types - Create/Edit Decision workflow
 */

import type { DecisionStatus } from '@/types/workspace'

export type Priority = 'low' | 'medium' | 'high'

export type MediaType = 'image' | 'pdf' | 'cad' | 'bim'

export interface MediaReference {
  id: string
  fileName: string
  url: string
  type: MediaType
  size?: number
  version: number
  uploadedAt: string
  isPrimary?: boolean
  thumbnailUrl?: string
}

export interface DecisionOptionForm {
  id: string
  title: string
  description?: string
  order: number
  mediaFiles: MediaReference[]
  caption?: string
  cost?: string
  version: number
  notes?: string
}

export interface ApprovalRuleForm {
  id: string
  approverId: string
  approverName?: string
  required: boolean
  deadline?: string
  allowComments: boolean
  clientCaptureName?: string
  clientCaptureEmail?: string
  status?: 'pending' | 'approved' | 'rejected'
}

export interface TriggerForm {
  id: string
  type: 'webhook' | 'task'
  targetUrl?: string
  payloadTemplate?: string
  active: boolean
  lastTriggered?: string
  outcome?: 'approve' | 'reject'
}

export interface ReminderForm {
  id: string
  scheduleType: 'date' | 'cron'
  scheduleValue: string
  message: string
  channel: 'email' | 'slack' | 'calendar'
  enabled: boolean
}

export interface DecisionEditorState {
  // Metadata
  title: string
  description: string
  templateId: string | null
  typeName: string
  dueDate: string | null
  priority: Priority
  status: DecisionStatus

  // Options
  options: DecisionOptionForm[]

  // Approval
  approvalRules: ApprovalRuleForm[]

  // Assignee & Reminders
  assigneeId: string | null
  reminders: ReminderForm[]

  // Triggers
  triggers: TriggerForm[]

  // Version
  version: number
}

export const DEFAULT_EDITOR_STATE: DecisionEditorState = {
  title: '',
  description: '',
  templateId: null,
  typeName: '',
  dueDate: null,
  priority: 'medium',
  status: 'draft',
  options: [],
  approvalRules: [],
  assigneeId: null,
  reminders: [],
  triggers: [],
  version: 1,
}

export type DecisionEditorStep =
  | 'metadata'
  | 'options'
  | 'comparison'
  | 'approval'
  | 'assignee'
  | 'review'

export const EDITOR_STEPS: { id: DecisionEditorStep; label: string }[] = [
  { id: 'metadata', label: 'Metadata' },
  { id: 'options', label: 'Options Upload' },
  { id: 'comparison', label: 'Side-by-Side Builder' },
  { id: 'approval', label: 'Approval Rules' },
  { id: 'assignee', label: 'Assignee & Reminders' },
  { id: 'review', label: 'Review & Publish' },
]
