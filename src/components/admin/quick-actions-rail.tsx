/**
 * Quick Actions Rail - add user, create escalation, impersonate.
 */

import { Link } from 'react-router-dom'
import { UserPlus, TicketPlus, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuickActionsRailProps {
  className?: string
}

export function QuickActionsRail({ className }: QuickActionsRailProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 rounded-xl border border-border bg-card p-4',
        className
      )}
    >
      <span className="flex w-full items-center text-sm font-medium text-muted-foreground sm:w-auto">
        Quick actions
      </span>
      <Button variant="outline" size="sm" asChild>
        <Link to="/admin/users">
          <UserPlus className="mr-2 h-4 w-4" />
          User Management
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link to="/admin/tools">
          <TicketPlus className="mr-2 h-4 w-4" />
          Create Escalation
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link to="/admin/users">
          <UserCog className="mr-2 h-4 w-4" />
          Impersonate
        </Link>
      </Button>
    </div>
  )
}
