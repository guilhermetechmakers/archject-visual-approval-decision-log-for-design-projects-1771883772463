/**
 * QuickActionsBar - Create Decision, Share Client Link, search
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Link2, Search, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface QuickActionsBarProps {
  searchValue?: string
  onSearchChange?: (value: string) => void
  placeholder?: string
  className?: string
  onShareClientLink?: () => void
}

export function QuickActionsBar({
  searchValue = '',
  onSearchChange,
  placeholder = 'Search projects, decisions...',
  className,
  onShareClientLink,
}: QuickActionsBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)
  const value = onSearchChange !== undefined ? searchValue : localSearch
  const setValue = onSearchChange ?? setLocalSearch

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-2',
          className
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
              asChild
            >
              <Link to="/dashboard/decisions/new">
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Create Decision</span>
                <span className="sm:hidden">Decision</span>
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Create a new decision</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            {onShareClientLink ? (
              <Button
                variant="secondary"
                size="sm"
                className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={onShareClientLink}
              >
                <Link2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Share Client Link</span>
                <span className="sm:hidden">Share</span>
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                asChild
              >
                <Link to="/dashboard/decisions">
                  <Link2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Share Client Link</span>
                  <span className="sm:hidden">Share</span>
                </Link>
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p>Share client link</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/dashboard/analytics">
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Open analytics & reports</p>
          </TooltipContent>
        </Tooltip>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="pl-9 rounded-lg bg-[#F5F6FA] border-border h-9"
            aria-label="Search"
          />
        </div>
      </div>
    </TooltipProvider>
  )
}
