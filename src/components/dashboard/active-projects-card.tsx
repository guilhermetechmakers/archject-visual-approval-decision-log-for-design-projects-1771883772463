/**
 * ActiveProjectsCard - Projects with quick-glance status
 */

import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectCard } from './project-card'
import type { DashboardProject } from '@/types/dashboard'

interface ActiveProjectsCardProps {
  projects: DashboardProject[]
  className?: string
}

export function ActiveProjectsCard({ projects, className }: ActiveProjectsCardProps) {
  return (
    <section className={className}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Active projects</h2>
        <Link to="/dashboard/projects">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </div>
      {projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No active projects yet</p>
          <Link to="/dashboard/projects" className="mt-4 inline-block">
            <Button className="transition-all hover:scale-[1.02]">
              <Plus className="mr-2 h-4 w-4" />
              Create project
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <div
              key={project.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${i * 50}ms`,
                animationFillMode: 'both',
              }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
