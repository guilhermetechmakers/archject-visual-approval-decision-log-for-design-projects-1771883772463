/**
 * Client Portal (No-login) types
 */

export interface BrandingConfig {
  logoUrl?: string | null
  accentColor?: string
  secondaryColor?: string
  domainPrefix?: string | null
  customDomain?: string | null
}

export interface MediaAsset {
  id: string
  type: 'image' | 'pdf' | 'render' | 'other'
  url: string
  thumbnailUrl?: string
  metadata?: Record<string, unknown>
}

export interface ClientPortalOption {
  id: string
  title: string
  description?: string | null
  mediaUrls: string[]
  mediaAssets: MediaAsset[]
  annotations: ClientPortalAnnotation[]
}

export interface ClientPortalAnnotation {
  id: string
  optionId: string
  mediaId: string
  shape: 'point' | 'rectangle' | 'area' | 'polygon' | 'freehand'
  coordinates: { x: number; y: number; width?: number; height?: number }
  points?: [number, number][]
  note?: string
  color?: string
  createdAt: string
}

export interface ClientPortalComment {
  id: string
  optionId: string
  threadId?: string | null
  authorId: string
  authorName?: string
  text: string
  createdAt: string
  mentions: string[]
}

export interface ApprovalRecord {
  id: string
  optionId: string
  approved: boolean
  clientName?: string
  timestamp: string
  otpVerified?: boolean
}

export interface ShareLink {
  token: string
  decisionId: string
  expiresAt?: string | null
  requiresOtp: boolean
  brandingOverride?: BrandingConfig | null
}

export interface NoLoginViewPayload {
  decision: {
    id: string
    title: string
    projectId: string
    createdAt: string
    updatedAt: string
  }
  options: ClientPortalOption[]
  mediaAssets: MediaAsset[]
  comments: ClientPortalComment[]
  annotations: ClientPortalAnnotation[]
  branding: BrandingConfig
  approvals?: ApprovalRecord[]
  linkExpiresAt?: string | null
  requiresOtp?: boolean
}

export interface ApprovePayload {
  optionId: string
  clientName?: string
  timestamp: string
  otpVerified?: boolean
}

export interface CommentPayload {
  optionId: string
  threadId?: string | null
  text: string
  mentions?: string[]
}

export interface AnnotationPayload {
  optionId: string
  mediaId: string
  annotationData: {
    shape: 'point' | 'rectangle' | 'area' | 'polygon' | 'freehand'
    coordinates: { x: number; y: number; width?: number; height?: number }
    points?: [number, number][]
    note?: string
    color?: string
  }
}

export interface GenerateLinkPayload {
  decisionId: string
  expirySeconds?: number
  requireOtp?: boolean
  brandingOverride?: BrandingConfig | null
}

export interface GenerateLinkResponse {
  token: string
  url: string
  expiresAt?: string | null
  requireOtp: boolean
}

export interface VerifyOtpPayload {
  email: string
  otp: string
  decisionId: string
}

export interface NotificationItem {
  id: string
  type: 'pending_approval' | 'comment_mention' | 'reminder' | 'approval_received'
  recipient: string
  readAt?: string | null
  payload: Record<string, unknown>
  createdAt: string
}
