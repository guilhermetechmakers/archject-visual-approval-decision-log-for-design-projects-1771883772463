import { Link } from 'react-router-dom'
import {
  Plus,
  FolderPlus,
  Upload,
  UserPlus,
  Link2,
  FileDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ActionQuickBarProps {
  className?: string
}

const actions = [
  {
    label: 'Create Decision',
    shortLabel: 'Decision',
    icon: Plus,
    to: '/dashboard/decisions/new',
    primary: true,
  },
  {
    label: 'Create Project',
    shortLabel: 'Project',
    icon: FolderPlus,
    to: '/dashboard/projects', // Could open modal in future
    primary: false,
  },
  {
    label: 'Upload Drawing',
    shortLabel: 'Upload',
    icon: Upload,
    to: '/dashboard/decisions',
    primary: false,
  },
  {
    label: 'Invite Client',
    shortLabel: 'Invite',
    icon: UserPlus,
    to: '/dashboard/team',
    primary: false,
  },
]

export function ActionQuickBar({ className }: ActionQuickBarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex flex-wrap items-center gap-2',
          className
        )}
      >
        {actions.map((action) => {
          const Icon = action.icon
          const btn = (
            <Button
              key={action.label}
              variant={action.primary ? 'default' : 'secondary'}
              size="sm"
              className={cn(
                'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                action.primary && 'shadow-md hover:shadow-lg'
              )}
              asChild
            >
              <Link to={action.to}>
                <Icon className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">{action.label}</span>
                <span className="sm:hidden">{action.shortLabel}</span>
              </Link>
            </Button>
          )
          return (
            <Tooltip key={action.label}>
              <TooltipTrigger asChild>{btn}</TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          )
        })}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Share client link">
              <Link2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Share client link</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Export summary">
              <FileDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export summary</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
