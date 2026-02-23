import { Link } from 'react-router-dom'
import { Plus, FolderKanban } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const mockProjects = [
  { id: '1', name: 'Riverside Villa', decisions: 8, pending: 3 },
  { id: '2', name: 'Urban Loft', decisions: 5, pending: 1 },
  { id: '3', name: 'Garden House', decisions: 12, pending: 4 },
]

export function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link to="/dashboard/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New project
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockProjects.map((project) => (
          <Link key={project.id} to={`/dashboard/projects/${project.id}`}>
            <Card className="transition-all hover:shadow-card-hover">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  {project.pending > 0 && (
                    <Badge variant="warning">{project.pending} pending</Badge>
                  )}
                </div>
                <h3 className="mt-4 font-semibold">{project.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {project.decisions} decisions
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function ProjectsPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
