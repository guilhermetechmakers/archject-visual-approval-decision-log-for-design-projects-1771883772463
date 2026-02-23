import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useDecisionEditor } from '@/contexts/decision-editor-context'
import type { Template } from '@/types/workspace'
import type { Priority } from '@/types/decision-editor'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  templateId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

type FormData = z.infer<typeof schema>

export interface DecisionEditorMetadataFormProps {
  templates: Template[]
  onNext?: () => void
}

export function DecisionEditorMetadataForm({
  templates,
  onNext,
}: DecisionEditorMetadataFormProps) {
  const { title, description, templateId, dueDate, priority, updateMetadata, setStep } =
    useDecisionEditor()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: title || '',
      description: description || '',
      templateId: templateId || '',
      dueDate: dueDate || '',
      priority: (priority || 'medium') as Priority,
    },
  })

  const onSubmit = (data: FormData) => {
    updateMetadata({
      title: data.title,
      description: data.description || '',
      templateId: data.templateId || null,
      dueDate: data.dueDate || null,
      priority: data.priority as Priority,
    })
    if (onNext) {
      onNext()
    } else {
      setStep('options')
    }
  }

  return (
    <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Decision metadata</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add title, description, template, due date, and priority.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Decision title *</Label>
            <Input
              id="title"
              placeholder="e.g. Kitchen Finishes - Countertops"
              {...form.register('title')}
              className={cn(form.formState.errors.title && 'border-destructive')}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief context for this decision..."
              rows={3}
              {...form.register('description')}
              className="resize-none"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="templateId">Template type</Label>
              <Select
                value={form.watch('templateId') || undefined}
                onValueChange={(v) => form.setValue('templateId', v)}

              >
                <SelectTrigger id="templateId">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={form.watch('priority')}
                onValueChange={(v) => form.setValue('priority', v as Priority)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due date</Label>
            <Input
              id="dueDate"
              type="date"
              {...form.register('dueDate')}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-[0.98]">
              Next: Options Upload
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
