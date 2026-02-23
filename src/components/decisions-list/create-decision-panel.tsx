import { useState } from 'react'
import { FileStack, Layout, FileEdit } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CreateDecisionModal, type CreateDecisionFormData } from '@/components/workspace'
import { cn } from '@/lib/utils'
import type { Template } from '@/types/workspace'
import type { TemplateType } from '@/types/workspace'

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

export interface CreateDecisionPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  templates: Template[]
  assignees: { id: string; name: string }[]
  onSubmit: (data: CreateDecisionFormData & { templateId?: string }) => Promise<void>
  isSubmitting?: boolean
  className?: string
}

export function CreateDecisionPanel({
  open,
  onOpenChange,
  projectId,
  templates,
  assignees,
  onSubmit,
  isSubmitting = false,
  className,
}: CreateDecisionPanelProps) {
  const [step, setStep] = useState<'template' | 'form'>('template')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)

  const handleTemplateSelect = (templateId: string | null) => {
    setSelectedTemplateId(templateId)
    setStep('form')
  }

  const handleSubmit = async (data: CreateDecisionFormData) => {
    await onSubmit({ ...data, templateId: selectedTemplateId ?? undefined })
    setStep('template')
    setSelectedTemplateId(null)
    onOpenChange(false)
  }

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      setStep('template')
      setSelectedTemplateId(null)
    }
    onOpenChange(nextOpen)
  }

  return (
    <>
      <Dialog open={open && step === 'template'} onOpenChange={handleClose}>
          <DialogContent className={cn('max-w-2xl', className)}>
            <DialogHeader>
              <DialogTitle>Create decision</DialogTitle>
              <DialogDescription>
                Choose a template to pre-fill fields, or start from scratch.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <Card
                className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/50"
                onClick={() => handleTemplateSelect(null)}
              >
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary">
                    <FileStack className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Blank decision</h3>
                    <p className="text-sm text-muted-foreground">
                      Start from scratch
                    </p>
                  </div>
                </CardContent>
              </Card>
              {templates.map((template) => {
                const Icon = typeIcons[template.type] ?? FileStack
                return (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:border-primary/50"
                    onClick={() => handleTemplateSelect(template.id)}
                  >
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {typeLabels[template.type as TemplateType] ?? template.type}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      <CreateDecisionModal
          open={open && step === 'form'}
          onOpenChange={(next) => {
            if (!next) {
              setStep('template')
              setSelectedTemplateId(null)
            }
            onOpenChange(next)
          }}
          projectId={projectId}
          assignees={assignees}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
    </>
  )
}
