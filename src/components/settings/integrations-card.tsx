import { useState, useEffect } from 'react'
import {
  Plug,
  Calendar,
  Box,
  Zap,
  CreditCard,
  Loader2,
  Settings2,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
  useIntegrations,
  useConnectIntegration,
  useDisconnectIntegration,
  useIntegrationMappings,
  useSaveIntegrationMappings,
} from '@/hooks/use-integrations'
import { ARCHJECT_DECISION_FIELDS, GOOGLE_CALENDAR_FIELDS } from '@/types/integrations'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const INTEGRATION_ICONS: Record<string, React.ElementType> = {
  google_calendar: Calendar,
  autodesk_forge: Box,
  zapier: Zap,
  stripe: CreditCard,
}

const PROVIDERS: { type: string; name: string; supportsMappings: boolean }[] = [
  { type: 'google_calendar', name: 'Google Calendar', supportsMappings: true },
  { type: 'autodesk_forge', name: 'Autodesk Forge', supportsMappings: false },
  { type: 'zapier', name: 'Zapier', supportsMappings: false },
]

export function IntegrationsCard() {
  const { data: integrations = [], isLoading } = useIntegrations()
  const connectMutation = useConnectIntegration()
  const disconnectMutation = useDisconnectIntegration()
  const [mappingModalId, setMappingModalId] = useState<string | null>(null)

  const handleConnect = async (provider: string) => {
    try {
      toast.info('Redirecting to authorization...')
      await connectMutation.mutateAsync({ provider })
      if (connectMutation.data?.message) {
        toast.info(connectMutation.data.message)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to connect')
    }
  }

  const handleDisconnect = async (id: string) => {
    if (id.startsWith('placeholder-')) return
    try {
      await disconnectMutation.mutateAsync(id)
      toast.success('Disconnected')
      setMappingModalId(null)
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  const items =
    integrations.length > 0
      ? integrations
      : PROVIDERS.map((p) => ({
          id: `placeholder-${p.type}`,
          type: p.type as 'google_calendar' | 'autodesk_forge' | 'zapier',
          name: p.name,
          status: 'disconnected' as const,
          connectedAt: null,
          scopes: [],
          lastSyncAt: null,
          lastError: null,
        }))

  if (isLoading) return null

  return (
    <div className="space-y-6">
      <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Plug className="h-5 w-5 text-primary" />
            <CardTitle>Third-Party Integrations</CardTitle>
          </div>
          <CardDescription>
            Google Calendar, Autodesk Forge, Zapier. OAuth connect, field mappings, calendar events.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((int) => {
              const Icon = INTEGRATION_ICONS[int.type] ?? Plug
              const isConnected = int.status === 'connected'
              const isPlaceholder = int.id.startsWith('placeholder-')
              const providerConfig = PROVIDERS.find((p) => p.type === int.type)
              const supportsMappings = providerConfig?.supportsMappings ?? false

              return (
                <div
                  key={int.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{int.name}</p>
                      {int.connectedAt && (
                        <p className="text-xs text-muted-foreground">
                          Connected {new Date(int.connectedAt).toLocaleDateString()}
                        </p>
                      )}
                      {int.lastSyncAt && (
                        <p className="text-xs text-muted-foreground">
                          Last sync: {new Date(int.lastSyncAt).toLocaleString()}
                        </p>
                      )}
                      {int.lastError && (
                        <p className="text-xs text-destructive">{int.lastError}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isConnected ? 'secondary' : 'outline'}
                      className={cn(
                        isConnected && 'bg-success/20 text-success',
                        int.status === 'error' && 'bg-destructive/20 text-destructive'
                      )}
                    >
                      {int.status}
                    </Badge>
                    {isConnected && supportsMappings && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMappingModalId(int.id)}
                        className="gap-1"
                      >
                        <Settings2 className="h-4 w-4" />
                        Mappings
                      </Button>
                    )}
                    {isConnected && !isPlaceholder ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(int.id)}
                        disabled={disconnectMutation.isPending}
                        className="rounded-full transition-all duration-200 hover:scale-[1.02]"
                      >
                        {disconnectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Disconnect'
                        )}
                      </Button>
                    ) : !isPlaceholder ? (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(int.type)}
                        disabled={connectMutation.isPending}
                        className="rounded-full bg-primary transition-all duration-200 hover:scale-[1.02]"
                      >
                        {connectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ExternalLink className="mr-1.5 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(int.type)}
                        disabled={connectMutation.isPending}
                        className="rounded-full bg-primary transition-all duration-200 hover:scale-[1.02]"
                      >
                        {connectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {mappingModalId && (
        <Dialog open={!!mappingModalId} onOpenChange={() => setMappingModalId(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Field mappings</DialogTitle>
              <DialogDescription>
                Map Archject decision fields to external system fields (e.g. Google Calendar).
              </DialogDescription>
            </DialogHeader>
            <FieldMappingEditor
              integrationId={mappingModalId}
              provider={items.find((i) => i.id === mappingModalId)?.type ?? 'google_calendar'}
              onClose={() => setMappingModalId(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function FieldMappingEditor({
  integrationId,
  provider,
  onClose,
}: {
  integrationId: string
  provider: string
  onClose: () => void
}) {
  const { data: mappings = [], isLoading } = useIntegrationMappings(integrationId)
  const saveMutation = useSaveIntegrationMappings(integrationId)
  const [localMappings, setLocalMappings] = useState<
    Array<{ archjectField: string; externalField: string; dataType: string; required: boolean }>
  >([])

  useEffect(() => {
    if (mappings.length > 0) {
      const next = mappings.map((m) => ({
        archjectField: m.archjectField,
        externalField: m.externalField,
        dataType: m.dataType,
        required: m.required,
      }))
      queueMicrotask(() => setLocalMappings(next))
    } else if (!isLoading) {
      queueMicrotask(() => setLocalMappings([]))
    }
  }, [mappings, isLoading])

  const externalFields =
    provider === 'google_calendar' ? GOOGLE_CALENDAR_FIELDS : ARCHJECT_DECISION_FIELDS

  const addMapping = () => {
    setLocalMappings((prev) => [
      ...prev,
      {
        archjectField: ARCHJECT_DECISION_FIELDS[0]?.value ?? 'decision.title',
        externalField: externalFields[0]?.value ?? 'summary',
        dataType: 'string',
        required: false,
      },
    ])
  }

  const removeMapping = (idx: number) => {
    setLocalMappings((prev) => prev.filter((_, i) => i !== idx))
  }

  const updateMapping = (
    idx: number,
    field: 'archjectField' | 'externalField' | 'dataType' | 'required',
    value: string | boolean
  ) => {
    setLocalMappings((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    )
  }

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(
        localMappings.map((m) => ({
          archjectField: m.archjectField,
          externalField: m.externalField,
          dataType: m.dataType as 'string' | 'number' | 'date' | 'boolean' | 'json',
          required: m.required,
        }))
      )
      toast.success('Field mappings saved')
      onClose()
    } catch {
      toast.error('Failed to save mappings')
    }
  }

  if (isLoading && mappings.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Archject → External</Label>
        <Button variant="outline" size="sm" onClick={addMapping} className="rounded-full">
          Add mapping
        </Button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {localMappings.map((m, idx) => (
          <div
            key={idx}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-input/30 p-3"
          >
            <Select
              value={m.archjectField}
              onValueChange={(v) => updateMapping(idx, 'archjectField', v)}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ARCHJECT_DECISION_FIELDS.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">→</span>
            <Select
              value={m.externalField}
              onValueChange={(v) => updateMapping(idx, 'externalField', v)}
            >
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {externalFields.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeMapping(idx)}
              aria-label="Remove mapping"
            >
              ×
            </Button>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={saveMutation.isPending || localMappings.length === 0}
          className="rounded-full bg-primary"
        >
          {saveMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Save mappings
        </Button>
      </div>
    </div>
  )
}
