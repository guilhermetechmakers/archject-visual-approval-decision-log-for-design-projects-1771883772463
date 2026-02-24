import { useState, useMemo, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileStack, Layout, FileEdit, Search, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Template, TemplateType } from '@/types/workspace'

export interface TemplatesLibraryProps {
  templates: Template[]
  projectId?: string
  onApplyTemplate?: (templateId: string) => void
  onCreateDecision?: () => void
  className?: string
}

const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  finishes: FileStack,
  layouts: Layout,
  change_request: FileEdit,
}

const typeLabels: Record<string, string> = {
  finishes: 'Finishes',
  layouts: 'Layouts',
  change_request: 'Change Request',
}

const TEMPLATE_TYPE_OPTIONS: { value: TemplateType | 'all'; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'finishes', label: 'Finishes' },
  { value: 'layouts', label: 'Layouts' },
  { value: 'change_request', label: 'Change Request' },
]

function TemplatePreviewCard({
  template,
  onApply,
}: {
  template: Template
  onApply: (id: string) => void
}) {
  const Icon = typeIcons[template.type] ?? FileStack
  const contentFields = template.content_json && typeof template.content_json === 'object' && 'fields' in template.content_json
    ? (template.content_json.fields as string[])
    : []
  const metadataKeys = template.metadataSchema && typeof template.metadataSchema === 'object'
    ? Object.keys(template.metadataSchema)
    : []
  const optionKeys = template.optionSchema && typeof template.optionSchema === 'object' && 'specs' in template.optionSchema
    ? (template.optionSchema.specs as string[])
    : template.optionSchema && typeof template.optionSchema === 'object' && 'layoutData' in template.optionSchema
      ? (template.optionSchema.layoutData as string[])
      : []

  return (
    <Card
      className={cn(
        'group transition-all duration-200 hover:shadow-card-hover',
        'border-border bg-card hover:bg-[rgb(var(--muted)/0.3)]'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground">{template.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {typeLabels[template.type] ?? template.type}
            </p>
            {template.description && (
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>
            )}
            {(contentFields.length > 0 || metadataKeys.length > 0 || optionKeys.length > 0) && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Template structure
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {contentFields.slice(0, 5).map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground"
                    >
                      {f}
                    </span>
                  ))}
                  {metadataKeys.length > 0 && metadataKeys.slice(0, 3).map((k) => (
                    <span
                      key={`meta-${k}`}
                      className="inline-flex items-center rounded-md bg-secondary/80 px-2 py-0.5 text-xs text-muted-foreground"
                    >
                      {k}
                    </span>
                  ))}
                  {optionKeys.length > 0 && optionKeys.slice(0, 3).map((k) => (
                    <span
                      key={`opt-${k}`}
                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {template.usageStats && (
              <p className="mt-2 text-xs text-muted-foreground">
                Used {template.usageStats.timesUsed} times
                {template.usageStats.successRate != null && (
                  <> · {Math.round((template.usageStats.successRate ?? 0) * 100)}% success</>
                )}
              </p>
            )}
            <Button
              size="sm"
              className="mt-4 transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
              onClick={() => onApply(template.id)}
            >
              Apply to new decision
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TemplatesLibrary({
  templates,
  projectId,
  onApplyTemplate,
  onCreateDecision,
  className,
}: TemplatesLibraryProps) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TemplateType | 'all'>('all')
  const [searchInput, setSearchInput] = useState('')

  const debouncedSearch = useDebounce(searchInput, 300)

  useEffect(() => {
    setSearch(debouncedSearch)
  }, [debouncedSearch])

  const filteredTemplates = useMemo(() => {
    let result = templates
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false) ||
          (typeLabels[t.type]?.toLowerCase().includes(q) ?? false)
      )
    }
    return result
  }, [templates, typeFilter, search])

  const handleApply = useCallback(
    (templateId: string) => {
      if (onApplyTemplate) {
        onApplyTemplate(templateId)
      } else if (projectId) {
        navigate(`/dashboard/projects/${projectId}/decisions/new?templateId=${templateId}`)
      }
    },
    [onApplyTemplate, projectId, navigate]
  )

  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Decision Templates Library</h2>
        <div className="flex flex-wrap items-center gap-2">
          {(onCreateDecision || projectId) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (onCreateDecision) onCreateDecision()
                else if (projectId) navigate(`/dashboard/projects/${projectId}/decisions/new`)
              }}
              className="rounded-full"
            >
              Create without template
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Search templates..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
            aria-label="Search templates"
          />
        </div>
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as TemplateType | 'all')}
        >
          <SelectTrigger className="w-[180px]" aria-label="Filter by type">
            <SelectValue placeholder="Template type" />
          </SelectTrigger>
          <SelectContent>
            {TEMPLATE_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {templates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileStack className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No templates available</p>
            <p className="text-sm text-muted-foreground">
              Templates will appear here when configured for your workspace.
            </p>
            {onCreateDecision && (
              <Button size="sm" className="mt-4" onClick={onCreateDecision}>
                Create decision without template
              </Button>
            )}
          </CardContent>
        </Card>
      ) : filteredTemplates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Search className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 font-medium">No templates match your search</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchInput('')
                setTypeFilter('all')
              }}
            >
              Clear filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <TemplatePreviewCard
              key={template.id}
              template={template}
              onApply={handleApply}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
