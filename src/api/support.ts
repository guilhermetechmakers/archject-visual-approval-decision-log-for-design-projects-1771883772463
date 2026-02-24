import { api } from '@/lib/api'

export interface SupportTicketPayload {
  name: string
  email: string
  message: string
  projectId?: string
}

export interface SupportTicketResponse {
  id?: string
  message: string
}

const SUPPORT_EMAIL = 'support@archject.com'

/**
 * Submit a support ticket via API. Falls back to mailto if endpoint is unavailable.
 */
export async function submitSupportTicket(
  payload: SupportTicketPayload
): Promise<SupportTicketResponse | null> {
  try {
    const response = await api.post<SupportTicketResponse>('/support/ticket', {
      name: payload.name.trim(),
      email: payload.email.trim(),
      message: payload.message.trim(),
      projectId: payload.projectId,
    })
    return response
  } catch {
    return null
  }
}

/**
 * Open mailto link with pre-filled support request (fallback when API is unavailable).
 */
export function openSupportMailto(name: string, email: string, message: string): void {
  const subject = encodeURIComponent('Support Request - 500 Error')
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  )
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
  window.location.href = mailto
}
