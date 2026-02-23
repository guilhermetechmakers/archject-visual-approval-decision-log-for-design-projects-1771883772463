import { UserPlus, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { TeamMember } from '@/types/workspace'

export interface TeamPanelProps {
  members: TeamMember[]
  projectId?: string
  onInvite?: () => void
  onRemoveMember?: (userId: string) => void
  className?: string
}

const roleLabels: Record<string, string> = {
  owner: 'Owner',
  editor: 'Editor',
  viewer: 'Viewer',
  client: 'Client',
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function TeamPanel({
  members,
  projectId: _projectId,
  onInvite,
  onRemoveMember,
  className,
}: TeamPanelProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Team & Permissions</h2>
        <Button size="sm" onClick={onInvite}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite member
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UserPlus className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 font-medium">No team members yet</p>
              <p className="text-sm text-muted-foreground">
                Invite colleagues or clients to collaborate on this project.
              </p>
              <Button size="sm" className="mt-4" onClick={onInvite}>
                Invite member
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {members.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-secondary/30"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{member.name}</p>
                      {member.email && (
                        <p className="text-sm text-muted-foreground truncate">
                          {member.email}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {roleLabels[member.role] ?? member.role}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        aria-label="Member actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit role</DropdownMenuItem>
                      <DropdownMenuItem>View permissions</DropdownMenuItem>
                      {member.role !== 'owner' && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onRemoveMember?.(member.user_id)}
                        >
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
