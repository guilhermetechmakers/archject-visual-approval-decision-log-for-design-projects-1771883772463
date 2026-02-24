/**
 * Tasks API - Light tasking engine linked to decisions
 */

import { api } from '@/lib/api'
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/tasks-webhooks'

export async function getTasks(params: {
  workspaceId?: string
  projectId?: string
  decisionId?: string
  status?: string
}): Promise<Task[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString()
  return api.get<Task[]>(`/tasks${qs ? `?${qs}` : ''}`)
}

export async function createTask(data: CreateTaskPayload): Promise<Task> {
  return api.post<Task>('/tasks', data)
}

export async function updateTask(id: string, data: UpdateTaskPayload): Promise<Task> {
  return api.put<Task>(`/tasks/${id}`, data)
}

export async function deleteTask(id: string): Promise<void> {
  return api.delete(`/tasks/${id}`)
}
