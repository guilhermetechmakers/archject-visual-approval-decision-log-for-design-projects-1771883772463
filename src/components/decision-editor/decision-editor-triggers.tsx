import { Plus, X, Zap, TestTube } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useDecisionEditor } from '@/contexts/decision-editor-context'

function generateId(): string {
  return `trg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface DecisionEditorTriggersProps {
  onTestTrigger?: (triggerId: string) => void
}

export function DecisionEditorTriggers({ onTestTrigger }: DecisionEditorTriggersProps) {
  const {
    triggers,
    addTrigger,
    updateTrigger,
    removeTrigger,
  } = useDecisionEditor()

  const handleAdd = () => {
    addTrigger({
      id: generateId(),
      type: 'webhook',
      targetUrl: '',
      payloadTemplate: '{"decision_id":"{{decisionId}}","outcome":"{{outcome}}"}',
      active: true,
      outcome: 'approve',
    })
  }

  return (
    <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Task & webhook triggers
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Map approval outcomes to webhooks or tasks. Zapier, PM tools, accounting.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAdd}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add trigger
          </Button>
        </div>

        {triggers.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center">
            <Zap className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No triggers</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add webhooks or tasks to fire on approval outcomes
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleAdd}
            >
              Add trigger
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {triggers.map((trigger) => (
              <div
                key={trigger.id}
                className="rounded-xl border border-border bg-secondary/20 p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Select
                      value={trigger.type}
                      onValueChange={(v) =>
                        updateTrigger(trigger.id, { type: v as 'webhook' | 'task' })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={trigger.outcome || 'approve'}
                      onValueChange={(v) =>
                        updateTrigger(trigger.id, {
                          outcome: v as 'approve' | 'reject',
                        })
                      }
                    >
                      <SelectTrigger className="w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">On approve</SelectItem>
                        <SelectItem value="reject">On reject</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge
                      variant={trigger.active ? 'default' : 'secondary'}
                      className={cn(trigger.active && 'bg-success/20 text-primary')}
                    >
                      {trigger.active ? 'Active' : 'Paused'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onTestTrigger?.(trigger.id)}
                      className="text-xs"
                    >
                      <TestTube className="mr-1 h-3 w-3" />
                      Test
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTrigger(trigger.id)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove trigger"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {trigger.type === 'webhook' && (
                  <>
                    <div className="space-y-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={trigger.targetUrl || ''}
                        onChange={(e) =>
                          updateTrigger(trigger.id, { targetUrl: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Payload template (JSON)</Label>
                      <Textarea
                        value={trigger.payloadTemplate || ''}
                        onChange={(e) =>
                          updateTrigger(trigger.id, {
                            payloadTemplate: e.target.value,
                          })
                        }
                        placeholder='{"decision_id":"{{decisionId}}","outcome":"{{outcome}}"}'
                        rows={3}
                        className="font-mono text-sm resize-none"
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={trigger.active}
                    onCheckedChange={(v) =>
                      updateTrigger(trigger.id, { active: v })
                    }
                  />
                  <Label className="text-sm">Active</Label>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
