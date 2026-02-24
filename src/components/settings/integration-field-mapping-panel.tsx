/**
 * Field Mapping Panel - Map Archject decision fields to external system fields
 * Live validation and sample data preview
 */

import { useState, useEffect } from 'react'
import { ArrowRight, Plus, Trash2, Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useIntegrationMappings,
  useUpdateIntegrationMappings,
} from '@/hooks/use-integrations'
import { toast } from 'sonner'
import type { IntegrationDisplay, FieldMapping } from '@/types/integrations'
import { ARCHJECT_DECISION_FIELDS } from '@/types/integrations'

const DATA_TYPES = [
  { value: 'string', label: 'String' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'json', label: 'JSON' },
] as const

const EXTERNAL_FIELDS_BY_PROVIDER: Record<string, { value: string; label: string }[]> = {
  google_calendar: [
    { value: 'summary', label: 'Event Summary' },
    { value: 'description', label: 'Event Description' },
    { value: 'start.dateTime', label: 'Start Time' },
    { value: 'end.dateTime', label: 'End Time' },
    { value: 'reminders', label: 'Reminders' },
  ],
  autodesk_forge: [
    { value: 'name', label: 'Asset Name' },
    { value: 'urn', label: 'URN' },
    { value: 'metadata', label: 'Metadata' },
  ],
  zapier: [
    { value: 'title', label: 'Title' },
    { value: 'description', label: 'Description' },
    { value: 'deadline', label: 'Deadline' },
    { value: 'status', label: 'Status' },
  ],
}

export interface IntegrationFieldMappingPanelProps {
  integration: IntegrationDisplay
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function IntegrationFieldMappingPanel({
  integration,
  open,
  onOpenChange,
}: IntegrationFieldMappingPanelProps) {
  const { data: mappings, isLoading } = useIntegrationMappings(integration.id)
  const updateMutation = useUpdateIntegrationMappings(integration.id)
  const [localMappings, setLocalMappings] = useState<
    Omit<FieldMapping, 'id' | 'integrationId' | 'createdAt' | 'updatedAt'>[]
  >([])

  const externalFields =
    EXTERNAL_FIELDS_BY_PROVIDER[integration.type] ?? EXTERNAL_FIELDS_BY_PROVIDER.zapier

  useEffect(() => {
    if (mappings) {
      setLocalMappings(
        mappings.map((m) => ({
          archjectField: m.archjectField,
          externalField: m.externalField,
          dataType: m.dataType,
          required: m.required,
          transformationScript: m.transformationScript ?? undefined,
        }))
      )
    } else {
      setLocalMappings([])
    }
  }, [mappings])

  const addMapping = () => {
    setLocalMappings((prev) => [
      ...prev,
      {
        archjectField: ARCHJECT_DECISION_FIELDS[0].value,
        externalField: externalFields[0]?.value ?? 'title',
        dataType: 'string' as const,
        required: false,
      },
    ])
  }

  const removeMapping = (index: number) => {
    setLocalMappings((prev) => prev.filter((_, i) => i !== index))
  }

  const updateMapping = (
    index: number,
    field: keyof (typeof localMappings)[0],
    value: string | boolean
  ) => {
    setLocalMappings((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )
  }

  const handleSave = async () => {
    const valid = localMappings.every(
      (m) => m.archjectField.trim() && m.externalField.trim()
    )
    if (!valid) {
      toast.error('All mappings must have Archject and external fields')
      return
    }
    try {
      await updateMutation.mutateAsync(localMappings)
      toast.success('Field mappings saved')
      onOpenChange(false)
    } catch {
      toast.error('Failed to save mappings')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Field mapping — {integration.type.replace('_', ' ')}</DialogTitle>
          <DialogDescription>
            Map Archject decision fields to external system fields. Sample preview shows mapped
            values.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label>Mappings</Label>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={addMapping}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add mapping
              </Button>
            </div>

            {localMappings.length === 0 ? (
              <div className="rounded-lg border-2 border-dashed border-border py-8 text-center text-muted-foreground">
                <p className="text-sm">No mappings configured</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={addMapping}>
                  Add first mapping
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {localMappings.map((mapping, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-secondary/30 p-3 sm:flex-row sm:items-center"
                  >
                    <Select
                      value={mapping.archjectField}
                      onValueChange={(v) => updateMapping(index, 'archjectField', v)}
                    >
                      <SelectTrigger className="w-full sm:w-48 rounded-lg bg-input">
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
                    <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                    <Select
                      value={mapping.externalField}
                      onValueChange={(v) => updateMapping(index, 'externalField', v)}
                    >
                      <SelectTrigger className="w-full sm:w-48 rounded-lg bg-input">
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
                    <Select
                      value={mapping.dataType}
                      onValueChange={(v) =>
                        updateMapping(index, 'dataType', v as FieldMapping['dataType'])
                      }
                    >
                      <SelectTrigger className="w-full sm:w-28 rounded-lg bg-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DATA_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => removeMapping(index)}
                      aria-label="Remove mapping"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Sample preview */}
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <Label className="text-xs text-muted-foreground">Sample preview</Label>
              <pre className="mt-2 overflow-x-auto rounded bg-background p-3 text-xs">
                {JSON.stringify(
                  {
                    decision: { title: 'Sample Decision', deadline: '2025-03-01' },
                    mapped: localMappings.reduce(
                      (acc, m) => {
                        acc[m.externalField] = `{${m.archjectField}}`
                        return acc
                      },
                      {} as Record<string, string>
                    ),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-full bg-primary"
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Save mappings'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
