/**
 * BrandingContext - Centralized theming state (branding tokens) propagated
 * to client portal, project workspace, and all client-facing views.
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import type { BrandingTokens, ColorTokens } from '@/types/branding'
import type { WorkspaceBranding } from '@/types/settings'

export interface BrandingState {
  tokens: Partial<BrandingTokens>
  accentColor: string
  primaryColor: string
  logoUrl: string | null
  headerText: string | null
  footerText: string | null
}

const DEFAULT_ACCENT = '#195C4A'
const DEFAULT_PRIMARY = '#195C4A'

const defaultState: BrandingState = {
  tokens: {},
  accentColor: DEFAULT_ACCENT,
  primaryColor: DEFAULT_PRIMARY,
  logoUrl: null,
  headerText: null,
  footerText: null,
}

interface BrandingContextValue extends BrandingState {
  setTokens: (tokens: Partial<BrandingTokens>) => void
  updateColorTokens: (colors: Partial<ColorTokens>) => void
}

const BrandingContext = createContext<BrandingContextValue | null>(null)

export function workspaceBrandingToTokens(b: Partial<WorkspaceBranding>): Partial<BrandingTokens> {
  return {
    logoUrl: b.logoUrl,
    accentColor: b.accentColor,
    colorTokens: {
      primary: b.primaryColor ?? b.accentColor,
      accent: b.accentColor,
      secondary: b.secondaryColor,
    },
    headerText: b.headerText,
    footerText: b.footerText,
    customCss: b.customCss,
  }
}

function tokensToState(tokens: Partial<BrandingTokens>): BrandingState {
  const accent =
    tokens.colorTokens?.accent ??
    tokens.accentColor ??
    DEFAULT_ACCENT
  const primary =
    tokens.colorTokens?.primary ??
    tokens.accentColor ??
    DEFAULT_PRIMARY
  return {
    tokens,
    accentColor: accent,
    primaryColor: primary,
    logoUrl: tokens.logoUrl ?? null,
    headerText: tokens.headerText ?? null,
    footerText: tokens.footerText ?? null,
  }
}

export function BrandingProvider({
  children,
  initialTokens,
  workspaceBranding,
}: {
  children: ReactNode
  initialTokens?: Partial<BrandingTokens>
  workspaceBranding?: Partial<WorkspaceBranding> | null
}) {
  const tokensFromWorkspace = useMemo(
    () => (workspaceBranding ? workspaceBrandingToTokens(workspaceBranding) : null),
    [workspaceBranding]
  )
  const effectiveInitial = initialTokens ?? tokensFromWorkspace ?? {}

  const [state, setState] = useState<BrandingState>(() =>
    Object.keys(effectiveInitial).length > 0
      ? tokensToState(effectiveInitial)
      : defaultState
  )

  useEffect(() => {
    if (tokensFromWorkspace && Object.keys(tokensFromWorkspace).length > 0) {
      setState(tokensToState(tokensFromWorkspace))
    }
  }, [tokensFromWorkspace])

  const setTokens = useCallback((tokens: Partial<BrandingTokens>) => {
    setState(tokensToState(tokens))
  }, [])

  const updateColorTokens = useCallback((colors: Partial<ColorTokens>) => {
    setState((prev) => {
      const nextTokens = {
        ...prev.tokens,
        colorTokens: { ...prev.tokens.colorTokens, ...colors },
      }
      return tokensToState(nextTokens)
    })
  }, [])

  const value = useMemo<BrandingContextValue>(
    () => ({
      ...state,
      setTokens,
      updateColorTokens,
    }),
    [state, setTokens, updateColorTokens]
  )

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  )
}

export function useBranding(): BrandingContextValue {
  const ctx = useContext(BrandingContext)
  if (!ctx) {
    return {
      ...defaultState,
      setTokens: () => {},
      updateColorTokens: () => {},
    }
  }
  return ctx
}
