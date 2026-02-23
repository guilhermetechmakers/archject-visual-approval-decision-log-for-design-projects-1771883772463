import { useParams, Link } from 'react-router-dom'
import { Share2, Download, MoreVertical, Edit, FileImage } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDecision } from '@/hooks/use-decision'
import { useProjectWorkspace } from '@/hooks/use-workspace'

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
  draft: 'default',
  pending: 'warning',
  approved: 'success',
  rejected: 'destructive',
}

export function DecisionDetailInternalPage() {
  const { projectId, decisionId } = useParams<{ projectId: string; decisionId: string }>()
  const { data: decision, isLoading } = useDecision(decisionId)
  const { project } = useProjectWorkspace(projectId ?? '')

  if (!projectId || !decisionId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Project or decision not found</p>
        <Button asChild className="mt-4" variant="outline">
          <Link to="/dashboard/projects">Back to projects</Link>
        </Button>
      </div>
    )
  }

  if (isLoading || !decision) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-secondary" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-64 rounded-xl bg-secondary" />
            <div className="h-32 rounded-xl bg-secondary" />
          </div>
          <div className="space-y-4">
            <div className="h-24 rounded-xl bg-secondary" />
            <div className="h-32 rounded-xl bg-secondary" />
          </div>
        </div>
      </div>
    )
  }

  const optionsCount = decision.options_count ?? 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/dashboard/projects/${projectId}`}>
            ← {project?.name ?? 'Project'}
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{decision.title}</h1>
          <p className="text-muted-foreground">{project?.name}</p>
          {decision.description && (
            <p className="mt-2 text-sm text-muted-foreground">
              {decision.description}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Share2 className="mr-2 h-4 w-4" />
            Share link
          </Button>
          <Button variant="outline" size="sm" className="transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/dashboard/projects/${projectId}/decisions/${decisionId}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to={`/dashboard/projects/${projectId}/decisions/${decisionId}/edit`}>
                  Edit decision
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Export PDF</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Visual comparison</CardTitle>
              <p className="text-sm text-muted-foreground">
                Side-by-side view for client review
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: Math.max(optionsCount, 2) }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-video rounded-lg bg-secondary flex flex-col items-center justify-center gap-2"
                  >
                    <FileImage className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Option {String.fromCharCode(65 + i)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Comments & annotations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-border p-8 text-center text-muted-foreground">
                No comments yet
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge
                variant={statusVariant[decision.status] ?? 'default'}
                className="text-sm"
              >
                {decision.status}
              </Badge>
              <p className="mt-2 text-sm text-muted-foreground">
                {decision.status === 'pending' && 'Awaiting client response'}
                {decision.status === 'approved' && 'Approved by client'}
                {decision.status === 'rejected' && 'Rejected'}
                {decision.status === 'draft' && 'Draft — not yet shared'}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due date</span>
                <span>{formatDate(decision.due_date)}</span>
              </div>
              {decision.assignee_name && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assignee</span>
                  <span>{decision.assignee_name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Options</span>
                <span>{optionsCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border shadow-card transition-all duration-200 hover:shadow-card-hover">
            <CardHeader>
              <CardTitle>Approval log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Created {formatDate(decision.created_at)}</p>
                <p>Last updated {formatDate(decision.updated_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
