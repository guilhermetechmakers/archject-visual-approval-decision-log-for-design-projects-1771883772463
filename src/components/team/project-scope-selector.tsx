import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import type { Project } from '@/types/team'

interface ProjectScopeSelectorProps {
  projects: Project[]
  value: string[]
  onChange: (projectIds: string[]) => void
  error?: string
  className?: string
}

export function ProjectScopeSelector({
  projects,
  value,
  onChange,
  error,
  className,
}: ProjectScopeSelectorProps) {
  const toggle = (projectId: string) => {
    if (value.includes(projectId)) {
      onChange(value.filter((id) => id !== projectId))
    } else {
      onChange([...value, projectId])
    }
  }

  const selectAll = () => {
    if (value.length === projects.length) {
      onChange([])
    } else {
      onChange(projects.map((p) => p.id))
    }
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={selectAll}
          className="text-sm font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
        >
          {value.length === projects.length ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      <ScrollArea className="h-[160px] rounded-lg border border-border p-3">
        <div className="space-y-2">
          {projects.map((project) => (
            <label
              key={project.id}
              className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-secondary/50"
            >
              <Checkbox
                checked={value.includes(project.id)}
                onCheckedChange={() => toggle(project.id)}
                aria-label={`Select ${project.name}`}
              />
              <div className="flex-1">
                <span className="text-sm font-medium">{project.name}</span>
                <p className="text-xs text-muted-foreground">
                  {project.currentStorageUsed} / {project.storageQuota} MB used
                </p>
              </div>
            </label>
          ))}
        </div>
      </ScrollArea>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
