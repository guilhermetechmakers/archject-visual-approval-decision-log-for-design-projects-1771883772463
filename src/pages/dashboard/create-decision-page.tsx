import { useState } from 'react'
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
import { useCreateDecisionMutation } from '@/hooks/use-decision'
import { toast } from 'sonner'

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

  const [, setIsPreviewMode] = useState(false)

  const handleSaveDraft = async () => {
    try {
      const decision = await createMutation.mutateAsync({ status: 'draft' })
      toast.success('Decision saved as draft')
      reset()
      navigate(`/dashboard/projects/${projectId}/decisions/${decision.id}/internal`)
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
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}`}>
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
              isSaving={createMutation.isPending}
              isPublishing={createMutation.isPending}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export function CreateDecisionPage() {
  return (
    <DecisionEditorProvider>
      <CreateDecisionContent />
    </DecisionEditorProvider>
  )
}
