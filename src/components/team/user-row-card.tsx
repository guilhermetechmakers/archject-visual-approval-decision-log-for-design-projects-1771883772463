import { MoreHorizontal, Pencil, Trash2, Mail } from 'lucide-react'
import { Avatar, AvatarFallback } from '@radix-ui/react-avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { User, Role, Project } from '@/types/team'

export interface UserRowCardProps {
  user: User
  roles: Role[]
  projects: Project[]
  onEditRoles?: (user: User) => void
  onRemove?: (user: User) => void
  onResendInvite?: (user: User) => void
  className?: string
}

function formatLastActive(iso?: string): string {
  if (!iso) return 'Never'
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 3600000) return 'Just now'
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  return d.toLocaleDateString()
}

function getRoleNames(user: User, roles: Role[]): string[] {
  const ids = new Set([
    ...user.globalRoles,
    ...user.projectRoles.map((pr) => pr.roleId),
  ])
  return roles.filter((r) => ids.has(r.id)).map((r) => r.name)
}

function getProjectNames(user: User, projects: Project[]): string[] {
  const ids = new Set(user.projectRoles.map((pr) => pr.projectId))
  return projects.filter((p) => ids.has(p.id)).map((p) => p.name)
}

export function UserRowCard({
  user,
  roles,
  projects,
  onEditRoles,
  onRemove,
  onResendInvite,
  className,
}: UserRowCardProps) {
  const roleNames = getRoleNames(user, roles)
  const projectNames = getProjectNames(user, projects)

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <Avatar className="h-10 w-10 shrink-0 rounded-full border border-border">
          <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {user.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {roleNames.map((r) => (
              <Badge key={r} variant="default" className="text-xs">
                {r}
              </Badge>
            ))}
            {projectNames.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {projectNames.join(', ')}
              </span>
            )}
          </div>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="text-sm text-muted-foreground">
            Last active: {formatLastActive(user.lastActive)}
          </p>
          <Badge
            variant={user.status === 'active' ? 'success' : 'secondary'}
            className="mt-1"
          >
            {user.status}
          </Badge>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEditRoles && (
            <DropdownMenuItem onClick={() => onEditRoles(user)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit roles
            </DropdownMenuItem>
          )}
          {onResendInvite && (
            <DropdownMenuItem onClick={() => onResendInvite(user)}>
              <Mail className="mr-2 h-4 w-4" />
              Resend invite
            </DropdownMenuItem>
          )}
          {onRemove && (
            <DropdownMenuItem
              destructive
              onClick={() => onRemove(user)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
