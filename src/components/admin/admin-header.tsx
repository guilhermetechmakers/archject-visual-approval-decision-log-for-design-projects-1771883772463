/**
 * Admin header - search, add, profile menu.
 */

import { Search, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface AdminHeaderProps {
  className?: string
}

export function AdminHeader({ className }: AdminHeaderProps) {
  return (
    <header
      className={cn(
        'flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-6',
        className
      )}
    >
      <div className="flex flex-1 items-center gap-4">
        <div className="relative hidden max-w-xs md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            placeholder="Search accounts, workspaces..."
            className="h-9 w-full pl-9"
            aria-label="Search"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm">
            Back to app
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="sr-only">Open profile menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/auth/login">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
