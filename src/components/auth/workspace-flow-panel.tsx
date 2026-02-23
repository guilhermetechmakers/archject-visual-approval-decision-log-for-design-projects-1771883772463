import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const workspaceSchema = z.object({
  workspaceName: z
    .string()
    .min(1, 'Workspace name is required')
    .max(64, 'Workspace name must be 64 characters or less'),
})

type WorkspaceFormData = z.infer<typeof workspaceSchema>

export interface WorkspaceFlowPanelProps {
  onComplete: (workspaceName: string) => void
  existingWorkspaces?: { id: string; name: string }[]
  className?: string
}

export function WorkspaceFlowPanel({
  onComplete,
  existingWorkspaces = [],
  className,
}: WorkspaceFlowPanelProps) {
  const [mode, setMode] = useState<'create' | 'select'>(
    existingWorkspaces.length > 0 ? 'select' : 'create'
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceFormData>({
    resolver: zodResolver(workspaceSchema),
  })

  const onSubmit = (data: WorkspaceFormData) => {
    onComplete(data.workspaceName)
  }

  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-6 shadow-card animate-fade-in',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Workspace</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        Create a workspace to collaborate with your team, or select an existing
        one.
      </p>

      {mode === 'select' && existingWorkspaces.length > 0 ? (
        <div className="space-y-2">
          {existingWorkspaces.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => onComplete(ws.name)}
              className="w-full text-left rounded-lg border border-border px-4 py-3 hover:bg-secondary/50 hover:border-primary/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {ws.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMode('create')}
            className="text-sm text-primary hover:underline"
          >
            Create new workspace
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspaceName">Workspace name</Label>
            <Input
              id="workspaceName"
              placeholder="My Studio"
              {...register('workspaceName')}
              aria-invalid={!!errors.workspaceName}
            />
            {errors.workspaceName && (
              <p className="text-sm text-destructive">
                {errors.workspaceName.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Create workspace
          </Button>
          {existingWorkspaces.length > 0 && (
            <button
              type="button"
              onClick={() => setMode('select')}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Select existing workspace
            </button>
          )}
        </form>
      )}
    </div>
  )
}
