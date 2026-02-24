import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchNoLoginView,
  approveDecision,
  requestChanges,
  addComment,
  addAnnotation,
  exportDecisionNoLogin,
  verifyOtp,
  sendOtp,
} from '@/api/client-portal'
import { getMockNoLoginView } from '@/lib/client-portal-mock'
import {
  exportClientPortalAsPDF,
  exportClientPortalAsJSON,
} from '@/lib/client-portal-export'
import type {
  NoLoginViewPayload,
  ApprovePayload,
  CommentPayload,
  AnnotationPayload,
} from '@/types/client-portal'

export function useClientPortalNoLogin(token: string) {
  const queryClient = useQueryClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['client-portal', 'no-login-view', token],
    queryFn: async () => {
      try {
        return await fetchNoLoginView(token)
      } catch {
        return getMockNoLoginView(token) as NoLoginViewPayload
      }
    },
    enabled: !!token,
    refetchInterval: 15000, // Poll every 15s for near real-time comment/annotation updates
  })

  const approveMutation = useMutation({
    mutationFn: (payload: ApprovePayload) =>
      approveDecision(token, data!.decision.id, payload),
    onSuccess: () => {
      toast.success('Approval recorded')
      queryClient.invalidateQueries({ queryKey: ['client-portal', 'no-login-view', token] })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to record approval')
    },
  })

  const requestChangesMutation = useMutation({
    mutationFn: (payload: { clientName?: string; message?: string }) =>
      requestChanges(token, data!.decision.id, payload),
    onSuccess: () => {
      toast.success('Changes requested')
      queryClient.invalidateQueries({ queryKey: ['client-portal', 'no-login-view', token] })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to request changes')
    },
  })

  const commentMutation = useMutation({
    mutationFn: (payload: CommentPayload) =>
      addComment(token, data!.decision.id, payload),
    onSuccess: () => {
      toast.success('Comment added')
      queryClient.invalidateQueries({ queryKey: ['client-portal', 'no-login-view', token] })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to add comment')
    },
  })

  const annotationMutation = useMutation({
    mutationFn: (payload: AnnotationPayload) =>
      addAnnotation(token, data!.decision.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-portal', 'no-login-view', token] })
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to add annotation')
    },
  })

  const [isExporting, setIsExporting] = useState(false)

  const handleExportPdf = useCallback(async () => {
    if (!data) return
    setIsExporting(true)
    try {
      const blob = await exportDecisionNoLogin(token, data.decision.id, 'pdf')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `decision-${data.decision.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('PDF exported')
    } catch {
      exportClientPortalAsPDF(data)
      toast.success('PDF exported')
    } finally {
      setIsExporting(false)
    }
  }, [token, data])

  const handleExportJson = useCallback(async () => {
    if (!data) return
    setIsExporting(true)
    try {
      const blob = await exportDecisionNoLogin(token, data.decision.id, 'json')
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `decision-${data.decision.id}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('JSON exported')
    } catch {
      const json = exportClientPortalAsJSON(data)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `decision-${data.decision.id}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('JSON exported')
    } finally {
      setIsExporting(false)
    }
  }, [token, data])

  const handleVerifyOtp = useCallback(
    async (email: string, otp: string) => {
      const res = await verifyOtp({ email, otp, decisionId: data!.decision.id })
      return res.verified
    },
    [data]
  )

  const handleSendOtp = useCallback(
    async (email: string) => {
      const res = await sendOtp(email, data!.decision.id)
      return res.sent
    },
    [data]
  )

  return {
    data,
    isLoading,
    error,
    refetch,
    approve: approveMutation.mutateAsync,
    requestChanges: requestChangesMutation.mutateAsync,
    addComment: commentMutation.mutateAsync,
    addAnnotation: annotationMutation.mutateAsync,
    handleExportPdf,
    handleExportJson,
    handleVerifyOtp,
    handleSendOtp,
    isExporting,
    isApproving: approveMutation.isPending,
    isRequestingChanges: requestChangesMutation.isPending,
  }
}
