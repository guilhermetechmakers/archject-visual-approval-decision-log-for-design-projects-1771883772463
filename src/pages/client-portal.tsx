import { useState, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Check, Loader2 } from 'lucide-react'
import {
  BrandedHeader,
  ShareExportBar,
  VerificationModal,
  OptionCard,
  CommentThread,
  NotificationTray,
  OperationSuccessModal,
} from '@/components/client-portal'
import {
  VisualSideBySideViewer,
  toComparisonOptionsFromClientPortal,
  toComparisonAnnotationsFromClientPortal,
} from '@/components/visual-comparison-viewer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClientPortalNoLogin } from '@/hooks/use-client-portal'
import { cn } from '@/lib/utils'
import type { ClientPortalAnnotation } from '@/types/client-portal'
import type { AnnotationShape } from '@/types/visual-comparison'

export function ClientPortalPage() {
  const { token, decisionToken } = useParams<{ token?: string; decisionToken?: string }>()
  const portalToken = token ?? decisionToken ?? ''
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [showVerification, setShowVerification] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [successType, setSuccessType] = useState<
    'approval_recorded' | 'changes_requested' | 'generic'
  >('generic')
  const [localAnnotations, setLocalAnnotations] = useState<ClientPortalAnnotation[]>([])
  const [activeCommentOptionId, setActiveCommentOptionId] = useState<string | null>(null)
  const [notifyStudio, setNotifyStudio] = useState(false)

  const {
    data,
    isLoading,
    error,
    approve,
    requestChanges,
    addComment,
    addAnnotation,
    handleExportPdf,
    handleExportJson,
    handleVerifyOtp,
    handleSendOtp,
    isExporting,
    isApproving,
    isRequestingChanges,
  } = useClientPortalNoLogin(portalToken)

  const accentColor = data?.branding?.accentColor ?? 'rgb(var(--primary))'

  const allAnnotations = [
    ...(data?.annotations ?? []),
    ...localAnnotations,
  ]

  const handleApprove = useCallback(async () => {
    if (!selectedOptionId || !data) return
    if (data.requiresOtp) {
      setShowVerification(true)
      return
    }
    try {
      await approve({
        optionId: selectedOptionId,
        clientName: clientName || undefined,
        timestamp: new Date().toISOString(),
      })
      setSuccessType('approval_recorded')
      setShowSuccess(true)
    } catch {
      // toast handled in hook
    }
  }, [selectedOptionId, data, clientName, approve])

  const handleRequestChanges = useCallback(async () => {
    if (!data) return
    if (data.requiresOtp) {
      setShowVerification(true)
      return
    }
    try {
      await requestChanges({ clientName: clientName || undefined })
      setSuccessType('changes_requested')
      setShowSuccess(true)
    } catch {
      // toast handled in hook
    }
  }, [data, clientName, requestChanges])

  const handleAddComment = useCallback(
    async (
      optionId: string,
      text: string,
      mentions?: string[],
      threadId?: string | null
    ) => {
      await addComment({ optionId, text, mentions, threadId })
    },
    [addComment]
  )

  const handleAddAnnotation = useCallback(
    async (
      optionId: string,
      mediaId: string,
      annotationData: {
        shape: AnnotationShape
        coordinates: { x: number; y: number; width?: number; height?: number }
        points?: [number, number][]
        note?: string
        color?: string
      }
    ) => {
      const shape = annotationData.shape === 'polygon' ? 'area' : annotationData.shape
      const normalized = { ...annotationData, shape }
      try {
        await addAnnotation({ optionId, mediaId, annotationData: normalized })
      } catch {
        setLocalAnnotations((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            optionId,
            mediaId,
            shape: normalized.shape,
            coordinates: annotationData.coordinates,
            note: annotationData.note,
            color: annotationData.color,
            createdAt: new Date().toISOString(),
          },
        ])
      }
    },
    [addAnnotation]
  )

  if (!portalToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Invalid or missing link.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
        <p className="text-destructive">Failed to load. The link may have expired.</p>
      </div>
    )
  }

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const approved = data.approvals?.some((a) => a.approved) ?? false

  if (approved) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 px-4">
        <div className="w-full max-w-md animate-fade-in-up rounded-2xl border border-border bg-card p-8 text-center shadow-card">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: `${accentColor}20` }}
          >
            <Check className="h-8 w-8" style={{ color: accentColor }} />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Approval received</h2>
          <p className="mt-2 text-muted-foreground">
            Thank you for your decision. The studio has been notified.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            You can close this window.
          </p>
        </div>
      </div>
    )
  }

  const commentsForOption = (optId: string) =>
    data.comments.filter((c) => c.optionId === optId)

  return (
    <div className="min-h-screen bg-background">
      <BrandedHeader
        decisionTitle={data.decision.title}
        branding={data.branding}
        instructions="Please review the options below and select your preferred choice."
        helpTip="Use the side-by-side viewer to compare options. Add comments or annotations to provide feedback."
      />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ShareExportBar
              linkExpiresAt={data.linkExpiresAt}
              onExportPdf={handleExportPdf}
              onExportJson={handleExportJson}
              onPrint={() => window.print()}
              isExporting={isExporting}
            />
            <NotificationTray
              notifications={[]}
              accentColor={accentColor}
            />
          </div>

          <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <VisualSideBySideViewer
              options={toComparisonOptionsFromClientPortal(data.options)}
              annotations={toComparisonAnnotationsFromClientPortal(allAnnotations)}
              layout="adaptive"
              syncPanZoom
              canAnnotate
              selectedOptionId={selectedOptionId}
              onSelectOption={setSelectedOptionId}
              onAnnotate={handleAddAnnotation}
              accentColor={accentColor}
            />
          </section>

          <section
            className="grid gap-6 md:grid-cols-2"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Select your choice</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {data.options.map((opt) => (
                  <OptionCard
                    key={opt.id}
                    option={opt}
                    isSelected={selectedOptionId === opt.id}
                    onSelect={() => setSelectedOptionId(opt.id)}
                    accentColor={accentColor}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Comments</h2>
              {data.options.length > 1 && (
                <div className="flex flex-wrap gap-2">
                  {data.options.map((opt) => (
                    <Button
                      key={opt.id}
                      variant={
                        (activeCommentOptionId ?? data.options[0]?.id) === opt.id
                          ? 'default'
                          : 'outline'
                      }
                      size="sm"
                      onClick={() => setActiveCommentOptionId(opt.id)}
                      style={
                        (activeCommentOptionId ?? data.options[0]?.id) === opt.id
                          ? { backgroundColor: accentColor }
                          : undefined
                      }
                    >
                      {opt.title}
                    </Button>
                  ))}
                </div>
              )}
              <CommentThread
                optionId={activeCommentOptionId ?? data.options[0]?.id ?? ''}
                optionTitle={
                  data.options.find((o) => o.id === (activeCommentOptionId ?? data.options[0]?.id))
                    ?.title
                }
                comments={commentsForOption(
                  activeCommentOptionId ?? data.options[0]?.id ?? ''
                )}
                onAddComment={(text, mentions, threadId) =>
                  handleAddComment(
                    activeCommentOptionId ?? data.options[0]?.id ?? '',
                    text,
                    mentions,
                    threadId
                  )
                }
                notifyStudio={notifyStudio}
                onNotifyStudioChange={setNotifyStudio}
                accentColor={accentColor}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <Label htmlFor="client-name" className="text-sm font-medium">
                Your name (optional, for the approval record)
              </Label>
              <Input
                id="client-name"
                type="text"
                placeholder="John Smith"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-2 max-w-xs"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={handleRequestChanges}
                disabled={isRequestingChanges}
                className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
              >
                {isRequestingChanges ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Request changes
              </Button>
              <Button
                disabled={!selectedOptionId || isApproving}
                onClick={handleApprove}
                className={cn(
                  'transition-all duration-200 hover:scale-[1.02] hover:shadow-md'
                )}
                style={{ backgroundColor: accentColor }}
              >
                {isApproving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Approve selection
              </Button>
            </div>
          </section>
        </div>
      </main>

      <VerificationModal
        open={showVerification}
        onOpenChange={setShowVerification}
        requireOtp={data.requiresOtp}
        onVerifyOtp={handleVerifyOtp}
        onSendOtp={handleSendOtp}
        onSkip={() => setShowVerification(false)}
        onNameCapture={() => {}}
        allowSkip={!data.requiresOtp}
        allowRemember
      />

      <OperationSuccessModal
        open={showSuccess}
        onOpenChange={setShowSuccess}
        type={successType}
        accentColor={accentColor}
        onClose={() => {
          setSelectedOptionId(null)
          setClientName('')
        }}
      />
    </div>
  )
}
