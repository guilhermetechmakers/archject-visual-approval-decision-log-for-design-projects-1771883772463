/**
 * LoadingContext - Global loading state for LoadingOverlay.
 * Use to trigger full-screen overlay from anywhere in the app.
 *
 * @example
 * // In App or layout
 * <LoadingProvider>
 *   <App />
 * </LoadingProvider>
 *
 * // In any component
 * const { showLoading, hideLoading, setProgress } = useLoading()
 * showLoading({ title: 'Saving...' })
 * setProgress(50)
 * hideLoading()
 */

import * as React from 'react'
import { LoadingOverlay } from '@/components/loading'

interface LoadingState {
  isOpen: boolean
  title?: string
  progress?: number
  blurBackground?: boolean
  dismissible?: boolean
}

interface LoadingContextValue {
  showLoading: (options?: {
    title?: string
    progress?: number
    blurBackground?: boolean
    dismissible?: boolean
  }) => void
  hideLoading: () => void
  setProgress: (progress: number) => void
  setTitle: (title: string) => void
  state: LoadingState
}

const LoadingContext = React.createContext<LoadingContextValue | null>(null)

export function useLoading() {
  const ctx = React.useContext(LoadingContext)
  if (!ctx) {
    return null
  }
  return ctx
}

interface LoadingProviderProps {
  children: React.ReactNode
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [state, setState] = React.useState<LoadingState>({
    isOpen: false,
    blurBackground: true,
  })

  const showLoading = React.useCallback(
    (options?: {
      title?: string
      progress?: number
      blurBackground?: boolean
      dismissible?: boolean
    }) => {
      setState({
        isOpen: true,
        title: options?.title,
        progress: options?.progress,
        blurBackground: options?.blurBackground ?? true,
        dismissible: options?.dismissible ?? false,
      })
    },
    []
  )

  const hideLoading = React.useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }))
  }, [])

  const setProgress = React.useCallback((progress: number) => {
    setState((prev) => (prev.isOpen ? { ...prev, progress } : prev))
  }, [])

  const setTitle = React.useCallback((title: string) => {
    setState((prev) => (prev.isOpen ? { ...prev, title } : prev))
  }, [])

  const value = React.useMemo<LoadingContextValue>(
    () => ({
      showLoading,
      hideLoading,
      setProgress,
      setTitle,
      state,
    }),
    [showLoading, hideLoading, setProgress, setTitle, state]
  )

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <LoadingOverlay
        isOpen={state.isOpen}
        title={state.title}
        progress={state.progress}
        blurBackground={state.blurBackground}
        dismissible={state.dismissible}
        onDismiss={hideLoading}
      />
    </LoadingContext.Provider>
  )
}
