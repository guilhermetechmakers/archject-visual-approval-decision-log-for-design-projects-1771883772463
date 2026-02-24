/**
 * Admin header - search, add, profile menu.
 * Uses design tokens and proper heading hierarchy for accessibility.
 */

import { Search, Plus, User, Loader2 } from 'lucide-react'
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
  /** Page/section title for heading hierarchy (default: "Admin") */
  title?: string
  /** Search input value (controlled) */
  searchValue?: string
  /** Called when search input changes */
  onSearchChange?: (value: string) => void
  /** Whether search is in progress (shows loading state) */
  isSearching?: boolean
  /** Whether add action is loading */
  isAddLoading?: boolean
  className?: string
}

export function AdminHeader({
  title = 'Admin',
  searchValue = '',
  onSearchChange,
  isSearching = false,
  isAddLoading = false,
  className,
}: AdminHeaderProps) {
  return (
    <header
      role="banner"
      className={cn(
        'flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-4 shadow-card transition-shadow duration-200 md:px-6',
        className
      )}
    >
      <div className="flex flex-1 items-center gap-3 sm:gap-4">
        <h1 className="text-base font-semibold text-foreground sm:text-lg">
          {title}
        </h1>
        <nav
          aria-label="Admin actions"
          className="flex flex-1 items-center gap-3 sm:gap-4"
        >
          <div className="relative hidden max-w-xs md:block">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search accounts, workspaces..."
              className="h-9 w-full min-h-[44px] pl-9"
              aria-label="Search accounts and workspaces"
              aria-busy={isSearching}
              disabled={isSearching}
              {...(onSearchChange !== undefined
                ? {
                    value: searchValue,
                    onChange: (e) => onSearchChange(e.target.value),
                  }
                : {})}
            />
            {isSearching && (
              <Loader2
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
                aria-hidden
              />
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="min-h-[44px] gap-2 sm:min-h-0"
            disabled={isAddLoading}
          >
            {isAddLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Add</span>
          </Button>
        </nav>
      </div>
      <nav
        aria-label="User menu"
        className="flex items-center gap-2"
      >
        <Link to="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="min-h-[44px] sm:min-h-0"
          >
            Back to app
          </Button>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-[44px] min-w-[44px] rounded-full sm:min-h-0 sm:min-w-0"
              aria-label="Open profile menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
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
      </nav>
    </header>
  )
}
