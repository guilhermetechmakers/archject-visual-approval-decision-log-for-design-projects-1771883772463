import { Link } from 'react-router-dom'
import {
  Edit,
  RotateCcw,
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export interface AdminActionsBarProps {
  projectId: string
  decisionId: string
  status: string
  onRevokeApproval?: () => void
  onExport?: (format: 'pdf' | 'csv' | 'json') => void
  onCreateTask?: () => void
  isRevoking?: boolean
  isExporting?: boolean
  className?: string
}

export function AdminActionsBar({
  projectId,
  decisionId,
  status,
  onRevokeApproval,
  onExport,
  onCreateTask,
  isRevoking = false,
  isExporting = false,
  className,
}: AdminActionsBarProps) {
  const canRevoke = status === 'approved' || status === 'rejected'

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-card',
        className
      )}
    >
      <Button asChild variant="outline" size="sm">
        <Link to={`/dashboard/projects/${projectId}/decisions/${decisionId}/edit`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit decision
        </Link>
      </Button>

      {canRevoke && onRevokeApproval && (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={onRevokeApproval}
          disabled={isRevoking}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Revoke approval
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isExporting}
            className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem
            onClick={() => onExport?.('pdf')}
            disabled={isExporting}
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onExport?.('csv')}
            disabled={isExporting}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onExport?.('json')}
            disabled={isExporting}
          >
            <FileJson className="mr-2 h-4 w-4" />
            JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {onCreateTask && (
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateTask}
          className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create task
        </Button>
      )}
    </div>
  )
}
