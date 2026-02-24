/**
 * Impersonation Context - tracks active impersonation session for admin support.
 * Session is stored in sessionStorage for persistence across refreshes.
 * All impersonation events are audited.
 */
/* eslint-disable react-refresh/only-export-components -- context file exports provider + hooks */

import * as React from 'react'

const STORAGE_KEY = 'archject_impersonation_session'

export interface ImpersonationSession {
  token: string
  workspaceId: string
  workspaceName: string
  startedAt: string
}

export interface StartSessionParams {
  sessionId: string
  targetUserId?: string
  targetWorkspaceId: string
  targetWorkspaceName: string
  targetUserName?: string
  startedAt: string
  reason?: string
}

interface ImpersonationContextValue {
  session: ImpersonationSession | null
  isImpersonating: boolean
  setSession: (session: ImpersonationSession) => void
  startSession: (params: StartSessionParams) => void
  clearSession: () => void
}

const ImpersonationContext = React.createContext<ImpersonationContextValue | null>(null)

function loadSession(): ImpersonationSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ImpersonationSession
  } catch {
    return null
  }
}

function saveSession(session: ImpersonationSession | null) {
  if (session) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function ImpersonationProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = React.useState<ImpersonationSession | null>(loadSession)

  React.useEffect(() => {
    const handler = () => setSessionState(loadSession())
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const setSession = React.useCallback((s: ImpersonationSession) => {
    saveSession(s)
    setSessionState(s)
  }, [])

  const clearSession = React.useCallback(() => {
    saveSession(null)
    setSessionState(null)
  }, [])

  const startSession = React.useCallback((params: StartSessionParams) => {
    const session: ImpersonationSession = {
      token: params.sessionId,
      workspaceId: params.targetWorkspaceId,
      workspaceName: params.targetWorkspaceName,
      startedAt: params.startedAt,
    }
    setSession(session)
  }, [setSession])

  const value: ImpersonationContextValue = React.useMemo(
    () => ({
      session,
      isImpersonating: !!session,
      setSession,
      startSession,
      clearSession,
    }),
    [session, setSession, startSession, clearSession]
  )

  return (
    <ImpersonationContext.Provider value={value}>
      {children}
    </ImpersonationContext.Provider>
  )
}

export function useImpersonation() {
  const ctx = React.useContext(ImpersonationContext)
  if (!ctx) {
    throw new Error('useImpersonation must be used within ImpersonationProvider')
  }
  return ctx
}

export function useImpersonationOptional() {
  return React.useContext(ImpersonationContext)
}
