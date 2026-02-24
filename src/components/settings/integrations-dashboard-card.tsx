import { useState } from 'react'
import {
  Plug,
  Calendar,
  Box,
  Zap,
  Loader2,
  Settings2,
  ChevronDown,
  ChevronUp,
  Check,
  ExternalLink,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useIntegrations,
  useConnectIntegration,
  useDisconnectIntegration,
  useIntegrationMappings,
  useSaveIntegrationMappings,
} from '@/hooks/use-integrations'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  ARCHJECT_DECISION_FIELDS,
  PROVIDER_NAMES,
  type IntegrationProvider,
  type FieldMapping,
} from '@/types/integrations'

const PROVIDER_ICONS: Record<IntegrationProvider, React.ElementType> = {
  google_calendar: Calendar,
  autodesk_forge: Box,
  zapier: Zap,
}

const PROVIDER_DESCRIPTIONS: Record<IntegrationProvider, string> = {
  google_calendar: 'Create calendar events for approval deadlines and team notifications',
  autodesk_forge: 'Embed IFC/DWG previews in decisions and projects',
  zapier: 'Connect to 5000+ apps via webhooks. Use the Webhooks section below.',
}

export function IntegrationsDashboardCard() {
  const { data: integrations = [], isLoading } = useIntegrations()
  const connectMutation = useConnectIntegration()
  const disconnectMutation = useDisconnectIntegration()
  const [expandedProvider, setExpandedProvider] = useState<IntegrationProvider | null>(null)

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      await connectMutation.mutateAsync({ provider })
      if (provider === 'zapier') {
        toast.info('Add a webhook endpoint and use the URL from your Zap')
      } else {
        toast.success(`Redirecting to ${PROVIDER_NAMES[provider]}...`)
      }
    } catch {
      toast.error('Failed to connect')
    }
  }

  const handleDisconnect = async (id: string) => {
    try {
      await disconnectMutation.mutateAsync(id)
      toast.success('Disconnected')
    } catch {
      toast.error('Failed to disconnect')
    }
  }

  const connectedByProvider = new Map<string, { id: string; lastSync?: string }>()
  integrations.forEach((int) => {
    if (int.status === 'connected') {
      connectedByProvider.set(int.type, { id: int.id, lastSync: int.lastSyncAt ?? undefined })
    }
  })

  if (isLoading) return null

  return (
    <Card className="rounded-xl border border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Plug className="h-5 w-5 text-primary" />
          <CardTitle>Third-Party Integrations</CardTitle>
        </div>
        <CardDescription>
          Connect Google Calendar, Autodesk Forge, and Zapier. OAuth tokens stored securely.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {(['google_calendar', 'autodesk_forge', 'zapier'] as IntegrationProvider[]).map(
          (provider) => {
            const Icon = PROVIDER_ICONS[provider]
            const connected = connectedByProvider.get(provider)
            const isConnected = !!connected
            const isExpanded = expandedProvider === provider

            return (
              <div
                key={provider}
                className={cn(
                  'rounded-xl border border-border p-4 transition-all duration-200',
                  isConnected ? 'bg-success/5' : 'bg-secondary/20'
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{PROVIDER_NAMES[provider]}</p>
                      <p className="text-xs text-muted-foreground">
                        {PROVIDER_DESCRIPTIONS[provider]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isConnected ? 'secondary' : 'outline'}
                      className={cn(
                        isConnected && 'bg-success/20 text-success',
                        !isConnected && 'text-muted-foreground'
                      )}
                    >
                      {isConnected ? (
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Connected
                        </span>
                      ) : (
                        'Disconnected'
                      )}
                    </Badge>
                    {isConnected ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => handleDisconnect(connected.id)}
                          disabled={disconnectMutation.isPending}
                        >
                          {disconnectMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Disconnect'
                          )}
                        </Button>
                        {provider !== 'zapier' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() =>
                              setExpandedProvider(isExpanded ? null : provider)
                            }
                          >
                            <Settings2 className="h-4 w-4" />
                            Configure
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        size="sm"
                        className="rounded-full bg-primary transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                        onClick={() => handleConnect(provider)}
                        disabled={connectMutation.isPending}
                      >
                        {connectMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {isConnected && provider !== 'zapier' && isExpanded && (
                  <div className="mt-4 border-t border-border pt-4">
                    <FieldMappingEditor integrationId={connected.id} provider={provider} />
                  </div>
                )}
              </div>
            )
          }
        )}
      </CardContent>
    </Card>
  )
}

function FieldMappingEditor({
  integrationId,
  provider,
}: {
  integrationId: string
  provider: IntegrationProvider
}) {
  const { data: mappings = [], isLoading } = useIntegrationMappings(integrationId)
  const saveMutation = useSaveIntegrationMappings(integrationId)
  const [localMappings, setLocalMappings] = useState<
    Omit<FieldMapping, 'id' | 'integrationId'>[] | null
  >(null)

  const displayMappings =
    localMappings !== null
      ? localMappings
      : mappings.map((m) => ({
          archjectField: m.archjectField,
          externalField: m.externalField,
          dataType: m.dataType,
          required: m.required,
          transformationScript: m.transformationScript,
        }))

  const externalFields =
    provider === 'google_calendar'
      ? [
          { value: 'summary', label: 'Event Summary' },
          { value: 'description', label: 'Description' },
          { value: 'start.dateTime', label: 'Start Time' },
          { value: 'end.dateTime', label: 'End Time' },
        ]
      : provider === 'autodesk_forge'
        ? [
            { value: 'urn', label: 'URN' },
            { value: 'name', label: 'Asset Name' },
          ]
        : []

  const addMapping = () => {
    setLocalMappings((prev) => {
      const base = prev ?? displayMappings
      return [
        ...base,
        {
          archjectField: ARCHJECT_DECISION_FIELDS[0].value,
          externalField: externalFields[0]?.value ?? 'field',
          dataType: 'string' as const,
          required: false,
        },
      ]
    })
  }

  const updateMapping = (index: number, field: string, value: unknown) => {
    setLocalMappings((prev) => {
      const base = prev ?? displayMappings
      const next = [...base]
      ;(next[index] as Record<string, unknown>)[field] = value
      return next
    })
  }

  const removeMapping = (index: number) => {
    setLocalMappings((prev) => {
      const base = prev ?? displayMappings
      return base.filter((_, i) => i !== index)
    })
  }

  const handleSave = async () => {
    const toSave = localMappings ?? displayMappings
    try {
      await saveMutation.mutateAsync(toSave)
      setLocalMappings(null)
      toast.success('Mappings saved')
    } catch {
      toast.error('Failed to save mappings')
    }
  }

  if (isLoading) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Field mapping</Label>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addMapping}>
            Add mapping
          </Button>
          <Button
            size="sm"
            className="rounded-full bg-primary"
            onClick={handleSave}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Map Archject decision fields to external system fields.
      </p>
      <div className="space-y-2">
        {(displayMappings.length > 0
          ? displayMappings
          : [{ archjectField: '', externalField: '', dataType: 'string' as const, required: false }]
        ).map((m, i) => (
          <div
            key={i}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3"
          >
            <Select
              value={m.archjectField}
              onValueChange={(v) => updateMapping(i, 'archjectField', v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Archject field" />
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
              onValueChange={(v) => updateMapping(i, 'externalField', v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="External field" />
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
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => removeMapping(i)}
              aria-label="Remove mapping"
            >
              ×
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
