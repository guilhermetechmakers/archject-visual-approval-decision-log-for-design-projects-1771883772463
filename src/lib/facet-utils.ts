import type { SearchEntityType } from '@/types/search'

export interface FacetOption {
  value: string
  label: string
  count?: number
}

export interface FacetSection {
  id: string
  label: string
  options: FacetOption[]
  collapsed?: boolean
  multiSelect?: boolean
}

const ENTITY_LABELS: Record<SearchEntityType, string> = {
  project: 'Projects',
  decision: 'Decisions',
  file: 'Files',
  comment: 'Comments',
}

export function buildFacetSectionsFromResults(
  results: { type: SearchEntityType; status?: string; projectName?: string }[],
  projects: { id: string; name: string }[] = []
): FacetSection[] {
  const typeCounts: Record<string, number> = {}
  const statusCounts: Record<string, number> = {}
  const projectCounts: Record<string, number> = {}

  for (const r of results) {
    typeCounts[r.type] = (typeCounts[r.type] ?? 0) + 1
    if (r.status) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1
    if (r.projectName) projectCounts[r.projectName] = (projectCounts[r.projectName] ?? 0) + 1
  }

  const typeOptions: FacetOption[] = (['project', 'decision', 'file', 'comment'] as SearchEntityType[]).map(
    (t) => ({ value: t, label: ENTITY_LABELS[t], count: typeCounts[t] })
  )
  const statusOptions: FacetOption[] = Object.entries(statusCounts).map(([v, c]) => ({
    value: v,
    label: v.charAt(0).toUpperCase() + v.slice(1),
    count: c,
  }))
  const projectOptions: FacetOption[] = projects.length
    ? projects.map((p) => ({ value: p.id, label: p.name, count: projectCounts[p.name] ?? 0 }))
    : Object.entries(projectCounts).map(([name, c]) => ({ value: name, label: name, count: c }))

  return [
    { id: 'entity_type', label: 'Type', options: typeOptions, collapsed: false },
    { id: 'status', label: 'Status', options: statusOptions, collapsed: statusOptions.length > 4 },
    { id: 'project_id', label: 'Project', options: projectOptions.slice(0, 20), collapsed: true },
  ]
}
