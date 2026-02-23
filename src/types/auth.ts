/** Auth API types - designed for self-contained MVP with clear extension points */

export interface User {
  id: string
  email: string
  emailVerified: boolean
  workspaceIds: string[]
  createdAt: string
}

export interface Workspace {
  id: string
  name: string
  domain?: string
  accountOwnerId: string
  memberUserIds: string[]
  createdAt: string
}

export interface AuthSession {
  token: string
  userId: string
  workspaceId: string | null
  emailVerified: boolean
}

export interface RegisterRequest {
  email: string
  password: string
  workspaceName?: string
  agreeToTerms: boolean
}

export interface RegisterResponse {
  userId: string
  workspaceId: string
  requiresEmailVerification: boolean
  token: string
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  token: string
  userId: string
  workspaceId: string | null
  emailVerified: boolean
}

export interface GoogleSignInRequest {
  idToken: string
}

export interface VerifyEmailRequest {
  userId: string
  token: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface CreateWorkspaceRequest {
  accountId: string
  workspaceName: string
}
