import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(['draft', 'pending']),
  due_date: z.string().optional(),
  assignee_id: z.string().optional(),
})

export type CreateDecisionFormData = z.infer<typeof schema>

export interface CreateDecisionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId?: string
  assignees?: { id: string; name: string }[]
  onSubmit: (data: CreateDecisionFormData) => Promise<void>
  isSubmitting?: boolean
}

export function CreateDecisionModal({
  open,
  onOpenChange,
  projectId: _projectId,
  assignees = [],
  onSubmit,
  isSubmitting = false,
}: CreateDecisionModalProps) {
  const [step, setStep] = useState(1)
  const form = useForm<CreateDecisionFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: 'draft',
      due_date: '',
      assignee_id: '',
    },
  })

  const handleSubmit = async (data: CreateDecisionFormData) => {
    if (step < 2) {
      setStep(2)
      return
    }
    await onSubmit(data)
    form.reset()
    setStep(1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create decision</DialogTitle>
          <DialogDescription>
            Step {step} of 2 — Add metadata and options. You can add images and
            attachments in the next step.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
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
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch('status')}
                onValueChange={(v) => form.setValue('status', v as 'draft' | 'pending')}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input
                id="due_date"
                type="date"
                {...form.register('due_date')}
              />
            </div>
          </div>
          {assignees.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={form.watch('assignee_id')}
                onValueChange={(v) => form.setValue('assignee_id', v)}
              >
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {assignees.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            {step === 1 ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="button" onClick={() => setStep(2)}>
                  Next: Add options
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create decision'}
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
