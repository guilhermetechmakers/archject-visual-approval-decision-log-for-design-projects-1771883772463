/**
 * CreateProjectModal - Create new project with workspace selection, branding, quotas
 */

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FolderKanban, Building2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateProject, useCreateWorkspace, useWorkspaces } from '@/hooks/use-projects'
import { cn } from '@/lib/utils'

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  primaryColor: z.string().optional(),
})

type CreateProjectFormData = z.infer<typeof createProjectSchema>

export interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (projectId: string) => void
  defaultWorkspaceId?: string
}

export function CreateProjectModal({
  open,
  onOpenChange,
  onSuccess,
  defaultWorkspaceId,
}: CreateProjectModalProps) {
  const [step, setStep] = useState<'project' | 'workspace'>('project')
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>(defaultWorkspaceId ?? '')

  const createProject = useCreateProject()
  const createWorkspace = useCreateWorkspace()
  const { data: workspacesData, isLoading: workspacesLoading } = useWorkspaces()
  const workspaces = workspacesData ?? []
  const effectiveWorkspaceId =
    selectedWorkspaceId && selectedWorkspaceId !== '__new__'
      ? selectedWorkspaceId
      : workspaces[0]?.id ?? ''

  useEffect(() => {
    if (open && workspaces.length === 0 && !workspacesLoading) {
      setStep('workspace')
    }
  }, [open, workspaces.length, workspacesLoading])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      clientName: '',
      clientEmail: '',
      primaryColor: '#195C4A',
    },
  })

  const primaryColor = watch('primaryColor')

  const handleCreateProject = async (data: CreateProjectFormData) => {
    if (!effectiveWorkspaceId) {
      setStep('workspace')
      return
    }

    try {
      const project = await createProject.mutateAsync({
        workspace_id: effectiveWorkspaceId,
        name: data.name,
        client_info: data.clientName || data.clientEmail
          ? { name: data.clientName, email: data.clientEmail || undefined }
          : undefined,
        branding: data.primaryColor ? { primary_color: data.primaryColor } : undefined,
      })
      reset()
      onOpenChange(false)
      onSuccess?.(project.id)
    } catch {
      // Error handled by mutation
    }
  }

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) return
    try {
      const ws = await createWorkspace.mutateAsync({
        name: newWorkspaceName.trim(),
      })
      setSelectedWorkspaceId(ws.id)
      setStep('project')
      setNewWorkspaceName('')
    } catch {
      // Error handled by mutation
    }
  }

  const handleClose = () => {
    reset()
    setStep('project')
    setNewWorkspaceName('')
    onOpenChange(false)
  }

  if (step === 'workspace') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create workspace
            </DialogTitle>
            <DialogDescription>
              Create a workspace to organize your projects. You need at least one workspace before creating a project.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Workspace name</Label>
              <Input
                id="workspace-name"
                placeholder="e.g. Studio Archject"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="rounded-lg bg-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStep('project')}>
              Back
            </Button>
            <Button
              onClick={handleCreateWorkspace}
              disabled={!newWorkspaceName.trim() || createWorkspace.isPending}
            >
              {createWorkspace.isPending ? 'Creating…' : 'Create workspace'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderKanban className="h-5 w-5" />
            Create project
          </DialogTitle>
          <DialogDescription>
            Create a new project with optional client details and branding.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleCreateProject)} className="space-y-4">
          {(workspaces.length > 0 || selectedWorkspaceId) && (
            <div className="space-y-2">
              <Label>Workspace</Label>
              <Select
                value={effectiveWorkspaceId || selectedWorkspaceId || workspaces[0]?.id || ''}
                onValueChange={(v) => {
                  if (v === '__new__') setStep('workspace')
                  else setSelectedWorkspaceId(v)
                }}
                disabled={workspacesLoading}
              >
                <SelectTrigger className="rounded-lg bg-input">
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws) => (
                    <SelectItem key={ws.id} value={ws.id}>
                      {ws.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">+ Create new workspace</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project-name">Project name *</Label>
            <Input
              id="project-name"
              placeholder="e.g. Riverside Villa"
              {...register('name')}
              className={cn('rounded-lg bg-input', errors.name && 'border-destructive')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client name (optional)</Label>
              <Input
                id="client-name"
                placeholder="Acme Construction"
                {...register('clientName')}
                className="rounded-lg bg-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-email">Client email (optional)</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="client@example.com"
                {...register('clientEmail')}
                className="rounded-lg bg-input"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary color (optional)</Label>
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor ?? '#195C4A'}
                onChange={(e) => setValue('primaryColor', e.target.value)}
                className="h-10 w-14 cursor-pointer rounded-lg border border-border"
              />
              <Input
                id="primary-color"
                value={primaryColor ?? '#195C4A'}
                onChange={(e) => setValue('primaryColor', e.target.value)}
                className="flex-1 rounded-lg bg-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createProject.isPending || !effectiveWorkspaceId}
            >
              {createProject.isPending ? 'Creating…' : 'Create project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
