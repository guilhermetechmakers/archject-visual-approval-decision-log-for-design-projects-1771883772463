/**
 * Decision Editor Integrations step
 * Calendar reminders, Forge previews, optional Zapier triggers
 */

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Calendar, Box, Zap } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIntegrations, useProjectIntegrations } from '@/hooks/use-integrations'
import { useDecisionEditor } from '@/contexts/decision-editor-context'
import { Button } from '@/components/ui/button'

const REMINDER_OPTIONS = [
  { value: '0', label: 'At time of event' },
  { value: '15', label: '15 minutes before' },
  { value: '30', label: '30 minutes before' },
  { value: '60', label: '1 hour before' },
  { value: '1440', label: '1 day before' },
  { value: '10080', label: '1 week before' },
] as const

export interface DecisionEditorIntegrationsProps {
  onNext?: () => void
}

export function DecisionEditorIntegrations({ onNext }: DecisionEditorIntegrationsProps) {
  const { projectId } = useParams<{ projectId: string }>()
  const editor = useDecisionEditor()
  const { data: projectIntegrations } = useProjectIntegrations(projectId ?? '')
  const { data: globalIntegrations } = useIntegrations()
  const integrations = (projectId ? projectIntegrations : globalIntegrations) ?? []

  const googleCalendar = integrations?.find((i) => i.type === 'google_calendar')
  const forge = integrations?.find((i) => i.type === 'autodesk_forge')
  const zapier = integrations?.find((i) => i.type === 'zapier')

  const [calendarEnabled, setCalendarEnabled] = useState(false)
  const [reminderMinutes, setReminderMinutes] = useState('30')
  const [forgeEnabled, setForgeEnabled] = useState(false)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Integrations</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Optional: add calendar reminders and Forge previews for this decision.
        </p>
      </div>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Google Calendar</CardTitle>
          </div>
          <CardDescription>
            Create a calendar event when this decision is saved. Requires Google Calendar connected
            in Settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleCalendar?.status === 'connected' ? (
            <>
              <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
                <div>
                  <Label htmlFor="calendar-toggle">Add calendar reminder</Label>
                  <p className="text-sm text-muted-foreground">
                    Event will be created with {editor.title} when you publish
                  </p>
                </div>
                <Switch
                  id="calendar-toggle"
                  checked={calendarEnabled}
                  onCheckedChange={setCalendarEnabled}
                />
              </div>
              {calendarEnabled && (
                <div className="space-y-2">
                  <Label>Reminder</Label>
                  <Select
                    value={reminderMinutes}
                    onValueChange={setReminderMinutes}
                  >
                    <SelectTrigger className="w-full rounded-lg bg-input sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REMINDER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Reminder will be created when you save. Due date: {editor.dueDate ?? 'Not set'}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-muted-foreground">
              <Calendar className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="font-medium">Google Calendar not connected</p>
              <p className="text-sm">Connect in Settings → Integrations to add reminders</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Autodesk Forge</CardTitle>
          </div>
          <CardDescription>
            BIM/CAD viewer previews for IFC/DWG assets. Preview links are generated when you add
            Forge-compatible assets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {forge?.status === 'connected' ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-4">
              <div>
                <Label htmlFor="forge-toggle">Enable Forge previews</Label>
                <p className="text-sm text-muted-foreground">
                  Preview links will appear when assets are uploaded
                </p>
              </div>
              <Switch
                id="forge-toggle"
                checked={forgeEnabled}
                onCheckedChange={setForgeEnabled}
              />
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-muted-foreground">
              <Box className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="font-medium">Autodesk Forge not connected</p>
              <p className="text-sm">Connect in Settings → Integrations</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Zapier</CardTitle>
          </div>
          <CardDescription>
            Webhook triggers fire when decision is created, approved, or revoked. Configure in
            Settings → Integrations → Webhooks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {zapier?.status === 'connected' ? (
            <div className="rounded-lg border border-border bg-success/10 p-4">
              <p className="text-sm font-medium text-success">Zapier webhooks active</p>
              <p className="text-xs text-muted-foreground">
                Events will be sent to your configured Zapier endpoints
              </p>
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-border py-12 text-center text-muted-foreground">
              <Zap className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p className="font-medium">Add webhooks in Settings</p>
              <p className="text-sm">Use Zapier Catch Hook and paste the URL in Webhooks</p>
            </div>
          )}
        </CardContent>
      </Card>

      {onNext && (
        <div className="flex justify-end pt-4">
          <Button
            onClick={onNext}
            className="rounded-full bg-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue to Review
          </Button>
        </div>
      )}
    </div>
  )
}
