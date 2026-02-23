import { Plus, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDecisionEditor } from '@/contexts/decision-editor-context'
import type { TeamMember } from '@/types/workspace'

function generateId(): string {
  return `rule-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface DecisionEditorApprovalRulesProps {
  teamMembers: TeamMember[]
  onNext?: () => void
}

export function DecisionEditorApprovalRules({
  teamMembers,
  onNext,
}: DecisionEditorApprovalRulesProps) {
  const {
    approvalRules,
    addApprovalRule,
    updateApprovalRule,
    removeApprovalRule,
    setStep,
  } = useDecisionEditor()

  const approvers = teamMembers.filter((m) => m.role !== 'client')

  const handleAdd = () => {
    addApprovalRule({
      id: generateId(),
      approverId: approvers[0]?.user_id || '',
      approverName: approvers[0]?.name,
      required: true,
      deadline: '',
      allowComments: true,
      status: 'pending',
    })
  }

  const handleNext = () => {
    if (onNext) {
      onNext()
    } else {
      setStep('assignee')
    }
  }

  const isValid = approvalRules.length > 0 && approvalRules.every((r) => r.approverId)

  return (
    <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Approval rules</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add required approvers, set deadlines, and configure client capture.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label>Required approvers</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            disabled={approvers.length === 0}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add approver
          </Button>
        </div>

        {approvalRules.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center">
            <p className="text-muted-foreground">No approvers added</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add at least one approver before publishing
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleAdd}
              disabled={approvers.length === 0}
            >
              Add approver
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {approvalRules.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-col gap-4 rounded-xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-end sm:gap-4"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <Label>Approver</Label>
                  <Select
                    value={rule.approverId}
                    onValueChange={(v) => {
                      const member = approvers.find((a) => a.user_id === v)
                      updateApprovalRule(rule.id, {
                        approverId: v,
                        approverName: member?.name,
                      })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select approver" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvers.map((m) => (
                        <SelectItem key={m.id} value={m.user_id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={rule.deadline || ''}
                    onChange={(e) =>
                      updateApprovalRule(rule.id, { deadline: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`comments-${rule.id}`}
                      checked={rule.allowComments}
                      onCheckedChange={(v) =>
                        updateApprovalRule(rule.id, { allowComments: v })
                      }
                    />
                    <Label htmlFor={`comments-${rule.id}`} className="text-sm">
                      Allow comments
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeApprovalRule(rule.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove approver"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 rounded-xl border border-border p-4">
          <h4 className="font-medium">Client contact capture (optional)</h4>
          <p className="text-sm text-muted-foreground">
            Capture client name and email when they approve
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Client name field</Label>
              <Input placeholder="Client name" disabled className="bg-secondary/50" />
            </div>
            <div className="space-y-2">
              <Label>Client email field</Label>
              <Input placeholder="Client email" disabled className="bg-secondary/50" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            These fields appear in the client portal when enabled.
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleNext}
            disabled={!isValid}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Next: Assignee & Reminders
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
