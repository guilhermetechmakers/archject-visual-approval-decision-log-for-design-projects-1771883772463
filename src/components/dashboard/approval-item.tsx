import { Link } from 'react-router-dom'
import { Copy, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusLabel } from './status-label'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { AwaitingApproval } from '@/types/dashboard'

export interface ApprovalItemProps {
  approval: AwaitingApproval
  onShareClick?: (approval: AwaitingApproval) => void
  className?: string
}

function formatDueDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days < 0) return 'Overdue'
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  if (days < 7) return `${days} days`
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''}`
}

function formatDaysSince(iso: string | null | undefined): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days === 0) return 'Updated today'
  if (days === 1) return '1 day since update'
  if (days < 7) return `${days} days since update`
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} since update`
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(
    () => toast.success(`${label} copied to clipboard`),
    () => toast.error('Failed to copy')
  )
}

export function ApprovalItem({
  approval,
  onShareClick,
  className,
}: ApprovalItemProps) {
  const dueLabel = formatDueDate(approval.due_date)
  const daysSince = formatDaysSince(approval.last_updated_at)
  const shareLink = approval.share_link ?? `https://archject.app/portal/${approval.decision_id}`

  const handleCopyLink = () => {
    copyToClipboard(shareLink, 'Client link')
    onShareClick?.(approval)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50',
          className
        )}
      >
        <Link
          to={`/dashboard/decisions/${approval.decision_id}`}
          className="min-w-0 flex-1"
        >
          <p className="font-medium truncate">{approval.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {approval.project_name && (
              <span>{approval.project_name}</span>
            )}
            {(approval.client_name ?? approval.client_email) && (
              <>
                <span>•</span>
                <span className="truncate">
                  {approval.client_name ?? approval.client_email}
                </span>
              </>
            )}
            {daysSince && (
              <>
                <span>•</span>
                <span title="Days since last update">{daysSince}</span>
              </>
            )}
          </div>
        </Link>

        <div className="flex shrink-0 items-center gap-2">
          <StatusLabel variant={approval.status === 'overdue' ? 'overdue' : 'pending'}>
            {approval.status === 'overdue' ? 'Overdue' : dueLabel}
          </StatusLabel>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleCopyLink()}
                aria-label="Copy share link"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy client link</p>
            </TooltipContent>
          </Tooltip>

          {approval.client_email && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Email client"
                  asChild
                >
                  <a href={`mailto:${approval.client_email}`}>
                    <Mail className="h-4 w-4" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Email client</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
