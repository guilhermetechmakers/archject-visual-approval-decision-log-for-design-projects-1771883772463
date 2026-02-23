/**
 * Files & Drawings Library - Extended types for versioning, previews, and decision linking
 */

import type { FileType } from '@/types/workspace'

export type AttachmentType = 'primary' | 'reference'

export interface FileVersion {
  id: string
  fileId: string
  versionNumber: number
  createdAt: string
  uploaderId: string
  uploaderName?: string | null
  notes?: string | null
  assetUrl: string
  previewUrl?: string | null
  size?: number
}

export interface DecisionAttachment {
  id: string
  decisionId: string
  decisionTitle?: string | null
  fileId: string
  attachedAt: string
  attachmentType: AttachmentType
  optionId?: string | null
  optionTitle?: string | null
}

export interface LibraryFile {
  id: string
  name: string
  type: FileType
  size: number
  mimeType: string
  currentVersionId: string
  uploadedBy: string
  uploadedByName?: string | null
  uploadedAt: string
  projectId: string
  isDeleted: boolean
  previewUrl?: string | null
  cdnUrl?: string | null
  etag?: string | null
  version: number
  linkedDecisionsCount: number
  linkedDecisions?: DecisionAttachment[]
}

export interface FileFilters {
  type?: FileType[]
  dateFrom?: string
  dateTo?: string
  linkedDecision?: boolean
  search?: string
}

export interface UploadProgress {
  fileId: string
  fileName: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/vnd.dwg',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
] as const

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024 // 100 MB
export const VERSION_NOTES_MIN = 5
export const VERSION_NOTES_MAX = 500
