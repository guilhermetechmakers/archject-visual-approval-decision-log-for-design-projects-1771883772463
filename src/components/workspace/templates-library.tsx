import { FileStack, Layout, FileEdit } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Template } from '@/types/workspace'

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

export function TemplatesLibrary({
  templates,
  projectId: _projectId,
  onApplyTemplate,
  onCreateDecision,
  className,
}: TemplatesLibraryProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Templates Library</h2>
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
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const Icon = typeIcons[template.type] ?? FileStack
            return (
              <Card
                key={template.id}
                className="transition-all duration-200 hover:shadow-card-hover hover:bg-[#F7F8FA]"
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {typeLabels[template.type] ?? template.type}
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4"
                        onClick={() => onApplyTemplate?.(template.id)}
                      >
                        Apply to new decision
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
