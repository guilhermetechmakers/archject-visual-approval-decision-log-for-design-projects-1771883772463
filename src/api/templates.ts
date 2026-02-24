/**
 * Templates API - CRUD, apply, publish
 */

import { api } from '@/lib/api'
import type { Template } from '@/types/workspace'
import type { ApplyTemplatePayload } from '@/api/workspace'
import { mockTemplates } from '@/lib/workspace-mock'

const USE_MOCK = !import.meta.env.VITE_API_URL

export async function fetchTemplates(params?: {
  type?: string
  public?: boolean
  search?: string
}): Promise<Template[]> {
  if (USE_MOCK) {
    let result = [...mockTemplates]
    if (params?.type && params.type !== 'all') {
      result = result.filter((t) => t.type === params.type)
    }
    if (params?.search) {
      const q = params.search.toLowerCase()
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.description?.toLowerCase().includes(q) ?? false)
      )
    }
    return result
  }
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<Template[]>(`/templates${qs ? `?${qs}` : ''}`)
}

export async function fetchTemplate(templateId: string): Promise<Template> {
  if (USE_MOCK) {
    const t = mockTemplates.find((x) => x.id === templateId)
    if (!t) throw new Error('Template not found')
    return t
  }
  return api.get<Template>(`/templates/${templateId}`)
}

export async function applyTemplate(
  projectId: string,
  templateId: string
): Promise<ApplyTemplatePayload> {
  if (USE_MOCK) {
    const t = mockTemplates.find((x) => x.id === templateId)
    if (!t) throw new Error('Template not found')
    return {
      title: t.name,
      description: t.description ?? undefined,
      metadata: t.metadataSchema ?? undefined,
      options: [
        { title: 'Option A', order: 0 },
        { title: 'Option B', order: 1 },
        { title: 'Option C', order: 2 },
      ],
      approvalRules: [],
      assigneeId: null,
      dueDate: null,
    }
  }
  return api.post<ApplyTemplatePayload>(
    `/projects/${projectId}/templates/${templateId}/apply`,
    {}
  )
}
