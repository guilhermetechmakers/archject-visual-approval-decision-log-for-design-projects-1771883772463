import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { DecisionMetadata } from '@/types/edit-decision'

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  category: z.string().max(100).optional(),
  owner_name: z.string().max(100).optional(),
  due_date: z.string().optional(),
  tags: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export interface MetadataEditorProps {
  metadata: DecisionMetadata | Record<string, unknown> | undefined
  onChange: (data: Partial<DecisionMetadata>) => void
  className?: string
}

export function MetadataEditor({
  metadata,
  onChange,
  className,
}: MetadataEditorProps) {
  const meta = metadata && typeof metadata === 'object' && 'title' in metadata
    ? (metadata as DecisionMetadata)
    : undefined

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: meta?.title ?? '',
      description: meta?.description ?? '',
      category: meta?.category ?? '',
      owner_name: meta?.owner_name ?? '',
      due_date: meta?.due_date ?? '',
      tags: Array.isArray(meta?.tags) ? meta.tags.join(', ') : '',
    },
  })

  const handleBlur = () => {
    const values = form.getValues()
    onChange({
      title: values.title,
      description: values.description || null,
      category: values.category || null,
      owner_name: values.owner_name || null,
      due_date: values.due_date || null,
      tags: values.tags
        ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
    })
  }

  return (
    <Card
      className={cn(
        'rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader>
        <CardTitle>Decision metadata</CardTitle>
        <p className="text-sm text-muted-foreground">
          Edit name, description, category, owner, due date, and tags.
        </p>
      </CardHeader>
      <CardContent>
        <form
          onBlur={handleBlur}
          onChange={() => form.trigger()}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Decision name *</Label>
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
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. finishes, layouts"
                {...form.register('category')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="owner_name">Owner</Label>
              <Input
                id="owner_name"
                placeholder="Assignee or owner"
                {...form.register('owner_name')}
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input
                id="due_date"
                type="date"
                {...form.register('due_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="kitchen, finishes, countertops"
                {...form.register('tags')}
              />
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
