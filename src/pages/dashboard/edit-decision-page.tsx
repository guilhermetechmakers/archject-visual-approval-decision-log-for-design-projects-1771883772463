import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
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
import { useDecision, useUpdateDecisionMutation } from '@/hooks/use-decision'
import { toast } from 'sonner'
import type { DecisionOptionForm, ApprovalRuleForm, ReminderForm, TriggerForm } from '@/types/decision-editor'

function EditDecisionContent() {
  const { projectId, decisionId } = useParams<{ projectId: string; decisionId: string }>()
  const navigate = useNavigate()
  const editor = useDecisionEditor()
  const { step, setStep, canGoToStep } = editor
  const { project, team, templates } = useProjectWorkspace(projectId ?? '')
  const { isLoading } = useDecision(decisionId)
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
  const updateMutation = useUpdateDecisionMutation(
    decisionId ?? '',
    projectId ?? '',
    getState
  )

  const handleSaveDraft = async () => {
    try {
      await updateMutation.mutateAsync({ status: 'draft' })
      toast.success('Decision saved as draft')
      navigate(`/dashboard/projects/${projectId}/decisions/${decisionId}/internal`)
    } catch {
      toast.error('Failed to save draft')
    }
  }

  const handlePublish = async () => {
    try {
      await updateMutation.mutateAsync({ status: 'pending' })
      toast.success('Decision published')
      navigate(`/dashboard/projects/${projectId}/decisions/${decisionId}/internal`)
    } catch {
      toast.error('Failed to publish')
    }
  }

  const handleValidatePreview = () => {
    toast.info('Preview mode — validate your decision layout')
  }

  const handleTestTrigger = (triggerId: string) => {
    toast.info(`Test trigger ${triggerId} — would send sample payload`)
  }

  if (!projectId || !decisionId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project or decision not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to projects
          </Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !project) {
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
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}/decisions/${decisionId}/internal`}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            {project.name}
          </Link>
        </Button>
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
              isSaving={updateMutation.isPending}
              isPublishing={updateMutation.isPending}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export function EditDecisionPage() {
  const { decisionId } = useParams<{ projectId: string; decisionId: string }>()
  const { data: decision, isLoading } = useDecision(decisionId)

  const initial = decision
    ? {
        title: decision.title,
        description: decision.description ?? '',
        templateId: decision.template_id ?? null,
        dueDate: decision.due_date ?? null,
        priority: 'medium' as const,
        status: decision.status,
        assigneeId: decision.assignee_id ?? null,
        options: [] as DecisionOptionForm[],
        approvalRules: [] as ApprovalRuleForm[],
        reminders: [] as ReminderForm[],
        triggers: [] as TriggerForm[],
      }
    : undefined

  if (isLoading) {
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
    <DecisionEditorProvider key={decisionId} initial={initial}>
      <EditDecisionContent />
    </DecisionEditorProvider>
  )
}
