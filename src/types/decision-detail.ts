/**
 * Decision Detail types - Internal view of a Decision Object
 */

import type { DecisionStatus } from '@/types/workspace'

export type MediaType = 'image' | 'drawing' | 'BIM' | 'pdf' | 'other'

export type AnnotationType = 'point' | 'rectangle' | 'callout'

export type ApprovalAction = 'approved' | 'rejected' | 'updated'

export interface DecisionMedia {
  id: string
  type: MediaType
  url: string
  version: number
  uploadedAt: string
  uploadedBy?: string | null
  size?: number
  thumbnailUrl?: string
}

export interface DecisionOption {
  id: string
  decisionId: string
  title: string
  description?: string | null
  cost?: string | null
  leadTime?: number | null
  dependencies: string[]
  isRecommended: boolean
  order: number
  attachments: DecisionMedia[]
  mediaPreviewIds: string[]
}

export type CommentStatus = 'active' | 'edited' | 'deleted'

export interface DecisionComment {
  id: string
  decisionId: string
  parentCommentId: string | null
  optionId?: string | null
  authorId: string
  authorName?: string
  authorAvatarUrl?: string | null
  content: string
  createdAt: string
  editedAt?: string | null
  editedBy?: string | null
  status?: CommentStatus
  mentions: string[]
  annotationIds?: string[]
}

export interface AnnotationData {
  coordinates: { x: number; y: number; width?: number; height?: number }
  label?: string
}

export interface DecisionAnnotation {
  id: string
  mediaId: string
  commentId: string
  type: AnnotationType
  data: AnnotationData
  createdBy: string
  createdAt: string
}

export interface DecisionApproval {
  id: string
  decisionId: string
  actorId: string
  actorName?: string
  role: string
  action: ApprovalAction
  timestamp: string
  ipAddress?: string | null
  clientInfo?: Record<string, unknown> | null
}

export interface DecisionFile {
  id: string
  decisionId: string
  fileName: string
  url: string
  version: number
  fileType: string
  uploadedAt: string
  uploadedBy?: string | null
}

export interface DecisionDetail extends Record<string, unknown> {
  id: string
  projectId: string
  title: string
  description?: string | null
  status: DecisionStatus
  createdAt: string
  updatedAt: string
  dueDate?: string | null
  assignees: string[]
  assigneeNames?: string[]
  ownerId?: string | null
  clientShareLinkId?: string | null
  lastActionTime?: string | null
}

export interface DecisionDetailFull {
  decision: DecisionDetail
  options: DecisionOption[]
  comments: DecisionComment[]
  annotations: DecisionAnnotation[]
  approvals: DecisionApproval[]
  files: DecisionFile[]
}
