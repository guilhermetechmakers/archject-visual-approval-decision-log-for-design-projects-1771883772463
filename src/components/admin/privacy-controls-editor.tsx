/**
 * Privacy Controls Editor - masking rules, data categories, access controls.
 */

import * as React from 'react'
import { Shield, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useUpdatePrivacyControls } from '@/hooks/use-governance'
import type { PrivacyControl } from '@/types/governance'
import { toast } from 'sonner'

interface PrivacyControlsEditorProps {
  workspaceId: string
  initialData?: PrivacyControl | null
  onSaved?: () => void
}

export function PrivacyControlsEditor({
  workspaceId,
  initialData,
  onSaved,
}: PrivacyControlsEditorProps) {
  const [requireApproval, setRequireApproval] = React.useState(
    (initialData?.access_controls as { require_approval?: boolean })?.require_approval ?? false
  )
  const [governanceNotes, setGovernanceNotes] = React.useState('')

  const updateMutation = useUpdatePrivacyControls()

  React.useEffect(() => {
    const ac = initialData?.access_controls as { require_approval?: boolean; notes?: string } | undefined
    setRequireApproval(ac?.require_approval ?? false)
    setGovernanceNotes(ac?.notes ?? '')
  }, [initialData])

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        workspaceId,
        data: {
          access_controls: {
            require_approval: requireApproval,
            notes: governanceNotes,
          },
        },
      })
      toast.success('Privacy controls updated')
      onSaved?.()
    } catch {
      toast.error('Failed to update privacy controls')
    }
  }

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader className="border-b border-border">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-primary" />
          Privacy settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <Label className="text-sm font-medium">Export approval required</Label>
            <p className="text-xs text-muted-foreground">
              Data exports require admin approval before download
            </p>
          </div>
          <Switch
            checked={requireApproval}
            onCheckedChange={setRequireApproval}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="governance-notes">Governance notes</Label>
          <Textarea
            id="governance-notes"
            value={governanceNotes}
            onChange={(e) => setGovernanceNotes(e.target.value)}
            placeholder="Internal notes for compliance, data ownership, or PII handling..."
            rows={4}
            className="rounded-lg bg-input"
          />
        </div>
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground">
            Data masking rules and categories are configured at the workspace level. Export scope
            selectors apply to all data export requests. Changes are logged in the audit trail.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="rounded-full transition-all duration-200 hover:scale-[1.02]"
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Shield className="mr-2 h-4 w-4" />
          )}
          Save changes
        </Button>
      </CardContent>
    </Card>
  )
}
