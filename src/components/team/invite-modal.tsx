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
import { ProjectScopeSelector } from './project-scope-selector'
import { cn } from '@/lib/utils'
import type { Role, Project } from '@/types/team'

const inviteSchema = z.object({
  email: z.string().email('Valid email is required'),
  roleId: z.string().min(1, 'Role is required'),
  message: z.string().max(500).optional(),
  projectsScoped: z.array(z.string()).min(1, 'Select at least one project'),
  expiresAt: z.string().optional(),
})

export type InviteFormData = z.infer<typeof inviteSchema>

interface InviteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: Role[]
  projects: Project[]
  onSubmit: (data: InviteFormData) => Promise<void>
  isSubmitting?: boolean
}

export function InviteModal({
  open,
  onOpenChange,
  roles,
  projects,
  onSubmit,
  isSubmitting = false,
}: InviteModalProps) {
  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      roleId: '',
      message: '',
      projectsScoped: [],
      expiresAt: '',
    },
  })

  const handleSubmit = async (data: InviteFormData) => {
    await onSubmit(data)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
          <DialogDescription>
            Send an email invite with role and project access. They will receive a
            link to join your workspace.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="colleague@example.com"
              {...form.register('email')}
              className={cn(form.formState.errors.email && 'border-destructive')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={form.watch('roleId')}
              onValueChange={(v) => form.setValue('roleId', v)}
            >
              <SelectTrigger
                id="invite-role"
                className={cn(form.formState.errors.roleId && 'border-destructive')}
              >
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.roleId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.roleId.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Project scope</Label>
            <ProjectScopeSelector
              projects={projects}
              value={form.watch('projectsScoped')}
              onChange={(ids) => form.setValue('projectsScoped', ids)}
              error={form.formState.errors.projectsScoped?.message}
            />
          </div>
          {roles.some((r) => r.name?.toLowerCase() === 'client') && (
            <div className="space-y-2">
              <Label htmlFor="invite-expires">Access expires (optional, for clients)</Label>
              <Input
                id="invite-expires"
                type="date"
                {...form.register('expiresAt')}
                className="rounded-lg bg-[#F5F6FA] border-border"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="invite-message">Message (optional)</Label>
            <Textarea
              id="invite-message"
              placeholder="Add a personal message to the invite..."
              rows={3}
              maxLength={500}
              {...form.register('message')}
            />
            <p className="text-xs text-muted-foreground">
              {form.watch('message')?.length ?? 0}/500 characters
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send invite'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
