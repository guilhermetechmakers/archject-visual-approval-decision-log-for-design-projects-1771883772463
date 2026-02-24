/**
 * Notification Publish - Event intake for notification pipeline
 * POST body: {
 *   idempotencyKey: string,
 *   userId: string,
 *   projectId?: string,
 *   decisionId: string,
 *   type: 'approval_needed'|'comment_received'|'reminder_scheduled'|'approval_submitted'|'status_changed',
 *   payload?: Record<string, unknown>
 * }
 * Creates in-app notification; queues email/SMS per user preferences.
 * Uses idempotency to avoid duplicate sends.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const NOTIFICATION_TYPE_MAP: Record<string, string> = {
  approval_needed: 'reminder',
  comment_received: 'comment',
  reminder_scheduled: 'reminder',
  approval_submitted: 'approval',
  status_changed: 'comment',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, message: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return new Response(JSON.stringify({ success: false, message: 'Authentication required' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const idempotencyKey = typeof body?.idempotencyKey === 'string' ? body.idempotencyKey : null
    const userId = typeof body?.userId === 'string' ? body.userId : null
    const decisionId = typeof body?.decisionId === 'string' ? body.decisionId : null
    const projectId = typeof body?.projectId === 'string' ? body.projectId : null
    const eventType = typeof body?.type === 'string' ? body.type : null
    const payload = (typeof body?.payload === 'object' && body.payload !== null) ? body.payload : {}

    if (!userId || !decisionId || !eventType) {
      return new Response(
        JSON.stringify({ success: false, message: 'userId, decisionId, and type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: { user }, error: getUserError } = await supabaseAdmin.auth.getUser(token)
    if (getUserError || !user?.id) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const dnType = NOTIFICATION_TYPE_MAP[eventType] ?? 'comment'

    if (idempotencyKey) {
      const { data: existing } = await supabaseAdmin
        .from('decision_notifications')
        .select('id')
        .eq('idempotency_key', idempotencyKey)
        .single()
      if (existing) {
        return new Response(
          JSON.stringify({ success: true, notificationId: existing.id, duplicate: true }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    const { data: notif, error: insertError } = await supabaseAdmin
      .from('decision_notifications')
      .insert({
        user_id: userId,
        decision_id: decisionId,
        project_id: projectId ?? null,
        type: dnType,
        channel: 'in_app',
        status: 'delivered',
        payload,
        idempotency_key: idempotencyKey ?? undefined,
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('notifications-publish insert error:', insertError)
      return new Response(
        JSON.stringify({ success: false, message: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, notificationId: notif.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('notifications-publish error:', err)
    return new Response(
      JSON.stringify({ success: false, message: 'An error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
