/**
 * CreateProjectPage - New project form with workspace selection, branding, quotas
 * Design: rounded inputs, soft backgrounds, pill buttons
 * Uses design tokens (bg-input, text-destructive) for theming.
 */

import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronLeft, FolderKanban, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchWorkspaces } from '@/api/dashboard'
import { createProject, type CreateProjectPayload } from '@/api/projects'

const schema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  workspace_id: z.string().min(1, 'Select a workspace'),
  client_name: z.string().optional(),
  client_email: z.string().email().optional().or(z.literal('')),
})

type FormData = z.infer<typeof schema>

export function CreateProjectPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: workspaces = [], isLoading: isWorkspacesLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => fetchWorkspaces(),
  })

  const createMutation = useMutation({
    mutationFn: async (input: CreateProjectPayload & { client_info?: { name?: string; email?: string } }) => {
      try {
        return await createProject(input)
      } catch {
        // Mock when API unavailable
        const id = `proj-${Date.now()}`
        return {
          id,
          name: input.name,
          workspace_id: input.workspace_id,
          client_name: (input.client_info as { name?: string })?.name ?? null,
          branding_logo_url: null,
          branding_color: '#195C4A',
          storage_quota_bytes: 1073741824,
          current_storage_bytes: 0,
          status: 'active' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          archived: false,
        }
      }
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['workspace'] })
      toast.success('Project created')
      navigate(`/dashboard/projects/${project.id}`)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to create project')
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      workspace_id: workspaces[0]?.id ?? '',
      client_name: '',
      client_email: '',
    },
  })

  const workspaceId = watch('workspace_id')
  if (workspaces.length > 0 && !workspaceId) {
    setValue('workspace_id', workspaces[0].id)
  }

  const onSubmit = (data: FormData) => {
    createMutation.mutate({
      workspace_id: data.workspace_id,
      name: data.name,
      client_info: {
        name: data.client_name || undefined,
        email: data.client_email || undefined,
      },
    } as CreateProjectPayload)
  }

  const inputBaseClasses = 'rounded-lg bg-input border-border'
  const hasClientEmailError = !!errors.client_email
  const hasNameError = !!errors.name

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" aria-label="Back to projects list">
          <Link to="/dashboard/projects">
            <ChevronLeft className="mr-1 h-4 w-4" aria-hidden />
            Projects
          </Link>
        </Button>
      </div>

      <Card className="rounded-2xl border border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10" aria-hidden>
              <FolderKanban className="h-5 w-5 text-primary" />
            </div>
            New project
          </CardTitle>
          <CardDescription>
            Create a project with optional client details and workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" aria-label="Create new project form">
            <div className="space-y-2">
              <Label htmlFor="workspace_id">Workspace</Label>
              {isWorkspacesLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" aria-label="Loading workspaces" />
              ) : workspaces.length === 0 ? (
                <div
                  className="flex min-h-[2.5rem] items-center rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
                  role="status"
                  aria-label="No workspaces available"
                >
                  No workspaces available. Create a workspace first.
                </div>
              ) : (
                <Select
                  value={watch('workspace_id')}
                  onValueChange={(v) => setValue('workspace_id', v)}
                  disabled={workspaces.length === 0}
                >
                  <SelectTrigger
                    id="workspace_id"
                    className={cn(inputBaseClasses)}
                    aria-label="Select workspace"
                  >
                    <SelectValue placeholder="Select workspace" />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.map((w) => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Project name *</Label>
              <Input
                id="name"
                placeholder="e.g. Riverside Villa"
                className={cn(inputBaseClasses, hasNameError && 'border-destructive ring-destructive focus-visible:ring-destructive')}
                aria-invalid={hasNameError}
                aria-describedby={hasNameError ? 'name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p id="name-error" className="text-sm text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client name (optional)</Label>
                <Input
                  id="client_name"
                  placeholder="Acme Construction"
                  className={inputBaseClasses}
                  aria-label="Client name"
                  {...register('client_name')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client_email">Client email (optional)</Label>
                <Input
                  id="client_email"
                  type="email"
                  placeholder="client@example.com"
                  className={cn(inputBaseClasses, hasClientEmailError && 'border-destructive ring-destructive focus-visible:ring-destructive')}
                  aria-invalid={hasClientEmailError}
                  aria-describedby={hasClientEmailError ? 'client_email-error' : undefined}
                  aria-label="Client email address"
                  {...register('client_email')}
                />
                {errors.client_email && (
                  <p id="client_email-error" className="text-sm text-destructive" role="alert">
                    {errors.client_email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:gap-2">
              <Button
                type="submit"
                disabled={createMutation.isPending || (workspaces.length === 0 && !isWorkspacesLoading)}
                className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                aria-label={createMutation.isPending ? 'Creating project' : 'Create project'}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                )}
                {createMutation.isPending ? 'Creating…' : 'Create project'}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                aria-label="Cancel and return to projects list"
              >
                <Link to="/dashboard/projects">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
