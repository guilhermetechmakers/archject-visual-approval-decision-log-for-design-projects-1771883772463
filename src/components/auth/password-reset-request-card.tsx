import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SecurityNotePanel } from './security-note-panel'
import { cn } from '@/lib/utils'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  workspace_id: z.string().optional(),
})

export type PasswordResetRequestFormData = z.infer<typeof schema>

export interface PasswordResetRequestCardProps {
  onSubmit: (data: PasswordResetRequestFormData) => Promise<void>
  isLoading?: boolean
  /** Show optional workspace/tenant field for enterprise flows */
  showWorkspaceField?: boolean
  className?: string
}

/**
 * Request Reset form: email input, submit button, inline validation,
 * aria-live region for announcements, keyboard accessible.
 */
export function PasswordResetRequestCard({
  onSubmit,
  isLoading = false,
  showWorkspaceField = false,
  className,
}: PasswordResetRequestCardProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(schema),
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn('space-y-6', className)}
      noValidate
    >
      <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/30 p-4">
        <Mail className="h-6 w-6 shrink-0 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Enter the email address associated with your account. We&apos;ll send a
          secure link to reset your password.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password-reset-email">Email</Label>
        <Input
          id="password-reset-email"
          type="email"
          placeholder="you@studio.com"
          autoComplete="email"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p
            id="email-error"
            className="text-sm text-destructive"
            role="alert"
          >
            {errors.email.message}
          </p>
        )}
      </div>

      {showWorkspaceField && (
        <div className="space-y-2">
          <Label htmlFor="password-reset-workspace">Workspace ID (optional)</Label>
          <Input
            id="password-reset-workspace"
            type="text"
            placeholder="Your workspace ID"
            autoComplete="organization"
            {...register('workspace_id')}
            aria-describedby="workspace-hint"
          />
          <p id="workspace-hint" className="text-xs text-muted-foreground">
            Required for some enterprise accounts
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send reset link'}
      </Button>

      <SecurityNotePanel />
    </form>
  )
}
