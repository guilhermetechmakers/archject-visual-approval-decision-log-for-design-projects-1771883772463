import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { ChevronLeft, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DecisionEditorProvider, useDecisionEditor } from '@/contexts/decision-editor-context'
import {
  DecisionEditorStepper,
  DecisionEditorMetadataForm,
  DecisionEditorOptionsUploader,
  DecisionEditorSideBySide,
  DecisionEditorApprovalRules,
  DecisionEditorAssigneeReminders,
  DecisionEditorTriggers,
  DecisionEditorReview,
} from '@/components/decision-editor'
import { useProjectWorkspace } from '@/hooks/use-workspace'
import { useCreateDecisionMutation } from '@/hooks/use-decision'
import * as workspaceApi from '@/api/workspace'
import { toast } from 'sonner'
import type { DecisionEditorState, DecisionOptionForm } from '@/types/decision-editor'

const AUTOSAVE_INTERVAL_MS = 60_000

function buildInitialFromTemplate(template: {
  id: string
  name: string
  type: string
  description?: string | null
  content_json?: Record<string, unknown>
  optionSchema?: Record<string, unknown> | null
}): Partial<DecisionEditorState> {
  const contentFields =
    template.content_json &&
    typeof template.content_json === 'object' &&
    'fields' in template.content_json
      ? (template.content_json.fields as string[])
      : []
  const optionSchema = template.optionSchema
  const optionSpecs =
    optionSchema && typeof optionSchema === 'object' && 'specs' in optionSchema
      ? (optionSchema.specs as string[])
      : optionSchema && typeof optionSchema === 'object' && 'layoutData' in optionSchema
        ? (optionSchema.layoutData as string[])
        : []
  const schemaFields = optionSpecs.length > 0 ? optionSpecs : contentFields
  const placeholderOptions: DecisionOptionForm[] =
    schemaFields.length > 0
      ? schemaFields.slice(0, 3).map((_, i) => ({
          id: `opt-${Date.now()}-${i}`,
          title: `Option ${i + 1}`,
          order: i,
          mediaFiles: [],
          version: 1,
        }))
      : []

  return {
    title: `${template.name} - `,
    description: template.description ?? '',
    templateId: template.id,
    typeName: template.type,
    options: placeholderOptions,
  }
}

function CreateDecisionContent() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const editor = useDecisionEditor()
  const { step, setStep, canGoToStep, reset } = editor
  const { project, team, templates } = useProjectWorkspace(projectId ?? '')
  const getState = () => ({
    title: editor.title,
    description: editor.description,
    templateId: editor.templateId,
    typeName: editor.typeName,
    dueDate: editor.dueDate,
    priority: editor.priority,
    status: editor.status,
    options: editor.options,
    approvalRules: editor.approvalRules,
    assigneeId: editor.assigneeId,
    reminders: editor.reminders,
    triggers: editor.triggers,
    version: editor.version,
  })
  const createMutation = useCreateDecisionMutation(projectId ?? '', getState)

  const [draftId, setDraftId] = useState<string | null>(null)
  const [autosaveStatus, setAutosaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [, setIsPreviewMode] = useState(false)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef(editor)
  editorRef.current = editor

  const performAutosave = useCallback(async () => {
    const state = editorRef.current
    if (!state.title?.trim() || !projectId) return

    setAutosaveStatus('saving')
    try {
      const payload = {
        title: state.title,
        description: state.description || undefined,
        due_date: state.dueDate || undefined,
        assignee_id: state.assigneeId || undefined,
        status: 'draft' as const,
      }
      if (draftId && projectId) {
        await workspaceApi.updateDecision(projectId, draftId, payload)
      } else {
        const decision = await workspaceApi.createDecision(projectId!, payload)
        setDraftId(decision.id)
      }
      setAutosaveStatus('saved')
      setTimeout(() => setAutosaveStatus('idle'), 2000)
    } catch {
      setAutosaveStatus('idle')
    }
  }, [projectId, draftId])

  useEffect(() => {
    const state = editorRef.current
    if (!state.title?.trim() || !projectId) return

    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = setTimeout(performAutosave, AUTOSAVE_INTERVAL_MS)
    return () => {
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    }
  }, [editor.title, editor.description, editor.dueDate, editor.assigneeId, projectId, performAutosave])

  const handleSaveDraft = async () => {
    try {
      if (draftId && projectId) {
        const payload = {
          title: editor.title,
          description: editor.description || undefined,
          due_date: editor.dueDate || undefined,
          assignee_id: editor.assigneeId || undefined,
          status: 'draft' as const,
        }
        await workspaceApi.updateDecision(projectId, draftId, payload)
        toast.success('Draft updated')
        navigate(`/dashboard/projects/${projectId}/decisions/${draftId}/internal`)
      } else {
        const decision = await createMutation.mutateAsync({ status: 'draft' })
        toast.success('Decision saved as draft')
        reset()
        navigate(`/dashboard/projects/${projectId}/decisions/${decision.id}/internal`)
      }
    } catch {
      toast.error('Failed to save draft')
    }
  }

  const handlePublish = async () => {
    try {
      const decision = await createMutation.mutateAsync({ status: 'pending' })
      toast.success('Decision published')
      reset()
      navigate(`/dashboard/projects/${projectId}/decisions/${decision.id}/internal`)
    } catch {
      toast.error('Failed to publish')
    }
  }

  const handleValidatePreview = () => {
    setIsPreviewMode(true)
    toast.info('Preview mode — validate your decision layout')
  }

  const handleTestTrigger = (triggerId: string) => {
    toast.info(`Test trigger ${triggerId} — would send sample payload`)
  }

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 rounded bg-secondary" />
        <div className="flex gap-6">
          <div className="h-64 w-56 rounded-xl bg-secondary" />
          <div className="flex-1 space-y-4">
            <div className="h-64 rounded-xl bg-secondary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {project.name}
          </Link>
        </Button>
        {editor.title.trim() && (
          <span
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
            aria-live="polite"
          >
            {autosaveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving draft…
              </>
            )}
            {autosaveStatus === 'saved' && (
              <>
                <Check className="h-4 w-4 text-success" aria-hidden />
                Draft saved
              </>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <DecisionEditorStepper
          currentStep={step}
          onStepClick={(s) => canGoToStep(s) && setStep(s)}
          canGoToStep={canGoToStep}
        />

        <main className="min-w-0 flex-1">
          {step === 'metadata' && (
            <DecisionEditorMetadataForm
              templates={templates}
              onNext={() => setStep('options')}
            />
          )}
          {step === 'options' && (
            <DecisionEditorOptionsUploader onNext={() => setStep('comparison')} />
          )}
          {step === 'comparison' && (
            <DecisionEditorSideBySide onNext={() => setStep('approval')} />
          )}
          {step === 'approval' && (
            <DecisionEditorApprovalRules
              teamMembers={team}
              onNext={() => setStep('assignee')}
            />
          )}
          {step === 'assignee' && (
            <div className="space-y-6">
              <DecisionEditorAssigneeReminders
                teamMembers={team}
                onNext={() => setStep('review')}
              />
              <DecisionEditorTriggers onTestTrigger={handleTestTrigger} />
            </div>
          )}
          {step === 'review' && (
            <DecisionEditorReview
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              onValidatePreview={handleValidatePreview}
              isSaving={createMutation.isPending}
              isPublishing={createMutation.isPending}
            />
          )}
        </main>
      </div>
    </div>
  )
}

function CreateDecisionPageInner() {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const templateIdFromState = (location.state as { templateId?: string } | null)?.templateId
  const templateIdFromUrl = searchParams.get('templateId')
  const templateId = templateIdFromState ?? templateIdFromUrl
  const { templates } = useProjectWorkspace(projectId ?? '')

  const initialState = useMemo(() => {
    if (!templateId || !templates.length) return undefined
    const template = templates.find((t) => t.id === templateId)
    if (!template) return undefined
    return buildInitialFromTemplate(template)
  }, [templateId, templates])

  return (
    <DecisionEditorProvider initial={initialState}>
      <CreateDecisionContent />
    </DecisionEditorProvider>
  )
}

export function CreateDecisionPage() {
  return <CreateDecisionPageInner />
}
