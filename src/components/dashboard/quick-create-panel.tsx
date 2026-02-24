/**
 * QuickCreatePanel - Global search and quick-create for projects, decisions, workspaces
 * Design: pill-shaped tabs, soft backgrounds, 8px increments
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  FolderKanban,
  FileText,
  Building2,
  Search,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { DashboardProject } from '@/types/dashboard'

export interface QuickCreatePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projects?: DashboardProject[]
  workspaceId?: string | null
  onCreateProject?: (name: string) => Promise<void>
  onCreateWorkspace?: (name: string) => Promise<void>
  className?: string
}

type CreateMode = 'decision' | 'project' | 'workspace' | null

export function QuickCreatePanel({
  open,
  onOpenChange,
  projects = [],
  workspaceId,
  onCreateProject,
  onCreateWorkspace,
  className,
}: QuickCreatePanelProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [createMode, setCreateMode] = useState<CreateMode>(null)
  const [newName, setNewName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredProjects = searchQuery.trim()
    ? projects.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects

  const handleCreateDecision = () => {
    if (filteredProjects[0]?.id) {
      navigate(`/dashboard/projects/${filteredProjects[0].id}/decisions/new`)
    } else {
      navigate('/dashboard/decisions/new')
    }
    onOpenChange(false)
  }

  const handleCreateProject = async () => {
    if (!newName.trim()) {
      toast.error('Enter a project name')
      return
    }
    setIsSubmitting(true)
    try {
      await onCreateProject?.(newName.trim())
      toast.success('Project created')
      setCreateMode(null)
      setNewName('')
      onOpenChange(false)
    } catch {
      toast.error('Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateWorkspace = async () => {
    if (!newName.trim()) {
      toast.error('Enter a workspace name')
      return
    }
    setIsSubmitting(true)
    try {
      await onCreateWorkspace?.(newName.trim())
      toast.success('Workspace created')
      setCreateMode(null)
      setNewName('')
      onOpenChange(false)
    } catch {
      toast.error('Failed to create workspace')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSelectProject = (projectId: string) => {
    navigate(`/dashboard/projects/${projectId}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-lg rounded-2xl border border-border bg-card p-0 shadow-card',
          className
        )}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            Quick create & search
          </DialogTitle>
          <DialogDescription>
            Create a decision, project, or workspace. Or search and jump to a project.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {!createMode ? (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={handleCreateDecision}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Create decision
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setCreateMode('project')}
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  New project
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full transition-all hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setCreateMode('workspace')}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  New workspace
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Search projects
                </Label>
                <div className="rounded-xl border border-border bg-[#F5F6FA] overflow-hidden">
                  <div className="flex items-center gap-2 border-b border-border px-3">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Type to search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto p-2">
                    {filteredProjects.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No projects found.
                      </p>
                    ) : (
                      filteredProjects.slice(0, 5).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectProject(p.id)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <FolderKanban className="h-4 w-4 text-primary" />
                          </div>
                          <span className="flex-1 truncate">{p.name}</span>
                          {p.active_decisions_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {p.active_decisions_count} pending
                            </span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setCreateMode(null)
                  setNewName('')
                }}
              >
                <X className="h-4 w-4" />
                Back
              </Button>
              <div className="space-y-2">
                <Label htmlFor="new-name">
                  {createMode === 'project' ? 'Project name' : 'Workspace name'}
                </Label>
                <Input
                  id="new-name"
                  placeholder={
                    createMode === 'project'
                      ? 'e.g. Riverside Villa'
                      : 'e.g. Studio Archject'
                  }
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-lg bg-[#F5F6FA] border-border"
                  autoFocus
                />
              </div>
              <DialogFooter className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCreateMode(null)
                    setNewName('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    createMode === 'project'
                      ? handleCreateProject
                      : handleCreateWorkspace
                  }
                  disabled={isSubmitting || !newName.trim()}
                >
                  {isSubmitting ? 'Creating…' : 'Create'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
