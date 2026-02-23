import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useDecisionEditor } from '@/contexts/decision-editor-context'
import { FileImage, Users, Calendar, Zap } from 'lucide-react'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export interface DecisionEditorReviewProps {
  onSaveDraft?: () => void
  onPublish?: () => void
  onValidatePreview?: () => void
  isSaving?: boolean
  isPublishing?: boolean
}

export function DecisionEditorReview({
  onSaveDraft,
  onPublish,
  onValidatePreview,
  isSaving = false,
  isPublishing = false,
}: DecisionEditorReviewProps) {
  const {
    title,
    description,
    dueDate,
    priority,
    options,
    approvalRules,
    reminders,
    triggers,
  } = useDecisionEditor()

  const optionsWithMedia = options.filter((o) => o.mediaFiles.length > 0)
  const isValid =
    title.length > 0 &&
    optionsWithMedia.length > 0 &&
    approvalRules.length > 0

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle>Review & publish</CardTitle>
          <p className="text-sm text-muted-foreground">
            Validate and publish your decision, or save as draft.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Summary</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Title</dt>
                  <dd className="font-medium">{title || '—'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Due date</dt>
                  <dd>{formatDate(dueDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd>
                    <Badge variant="secondary" className="capitalize">
                      {priority}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Contents</h4>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm">
                  <FileImage className="h-4 w-4" />
                  {optionsWithMedia.length} options
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm">
                  <Users className="h-4 w-4" />
                  {approvalRules.length} approvers
                </span>
                {reminders.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm">
                    <Calendar className="h-4 w-4" />
                    {reminders.length} reminders
                  </span>
                )}
                {triggers.length > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-1.5 text-sm">
                    <Zap className="h-4 w-4" />
                    {triggers.length} triggers
                  </span>
                )}
              </div>
            </div>
          </div>

          {description && (
            <div className="space-y-2">
              <h4 className="font-medium">Description</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onValidatePreview}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Validate & preview
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSaving ? 'Saving...' : 'Save draft'}
            </Button>
            <Button
              type="button"
              onClick={onPublish}
              disabled={!isValid || isPublishing}
              className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
            >
              {isPublishing ? 'Publishing...' : 'Publish'}
            </Button>
          </div>

          {!isValid && (
            <p className="text-sm text-muted-foreground">
              Complete title, at least one option with media, and at least one
              approver to publish.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
