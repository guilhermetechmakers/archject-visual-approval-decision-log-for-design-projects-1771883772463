/**
 * Webhooks API - Endpoint management with signing and retry
 */

import { api } from '@/lib/api'
import type {
  WebhookEndpoint,
  CreateWebhookPayload,
  UpdateWebhookPayload,
  WebhookTestResult,
} from '@/types/tasks-webhooks'

export async function getWebhooks(workspaceId?: string): Promise<WebhookEndpoint[]> {
  const qs = workspaceId ? `?workspace_id=${encodeURIComponent(workspaceId)}` : ''
  return api.get<WebhookEndpoint[]>(`/webhooks${qs}`)
}

export async function createWebhook(data: CreateWebhookPayload): Promise<WebhookEndpoint> {
  return api.post<WebhookEndpoint>('/webhooks', data)
}

export async function updateWebhook(
  id: string,
  data: UpdateWebhookPayload
): Promise<WebhookEndpoint> {
  return api.put<WebhookEndpoint>(`/webhooks/${id}`, data)
}

export async function deleteWebhook(id: string): Promise<void> {
  return api.delete(`/webhooks/${id}`)
}

export async function testWebhook(id: string): Promise<WebhookTestResult> {
  return api.post<WebhookTestResult>(`/webhooks/${id}/test`, {})
}
